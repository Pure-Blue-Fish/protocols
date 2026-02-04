// ABOUTME: Tool definitions and execution for Gemini function calling
// ABOUTME: Handles protocol editing and creation via GitHub API

import { Type, type FunctionDeclaration } from "@google/genai";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "Pure-Blue-Fish/protocols";
const BRANCH = "master";

async function githubRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return res;
}

// Valid categories from CLAUDE.md
const VALID_CATEGORIES = [
  "feeding",
  "water-quality",
  "treatments",
  "tank-procedures",
  "pool-procedures",
  "transfers",
  "monitoring",
  "arrival",
  "lab",
  "other",
] as const;

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "edit_protocol",
    description:
      "Edit an existing protocol. Use this when the user asks to modify, update, or add content to an existing protocol.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        slug: {
          type: Type.STRING,
          description:
            "The protocol slug shown in each protocol header (e.g. 'feed-fattening', 'daily-clean'). NOT the protocol number.",
        },
        title: {
          type: Type.STRING,
          description: "New title for the protocol (optional, keep existing if not changing)",
        },
        category: {
          type: Type.STRING,
          description:
            "Protocol category: feeding, water-quality, treatments, tank-procedures, pool-procedures, transfers, monitoring, arrival, lab, other",
        },
        protocolNumber: {
          type: Type.STRING,
          description: "Protocol number like PRO.X.X.X (optional)",
        },
        frequency: {
          type: Type.STRING,
          description: "How often the protocol is performed (optional)",
        },
        body: {
          type: Type.STRING,
          description:
            "The full markdown body of the protocol (everything after frontmatter). Include all sections.",
        },
        changeDescription: {
          type: Type.STRING,
          description: "Brief description of what changed, for the git commit message",
        },
        lang: {
          type: Type.STRING,
          description: "Language: 'he' for Hebrew (default) or 'en' for English",
        },
      },
      required: ["slug", "body", "changeDescription"],
    },
  },
  {
    name: "create_protocol",
    description:
      "Create a new protocol. Use this when the user asks to create a new procedure or protocol that doesn't exist yet.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        slug: {
          type: Type.STRING,
          description:
            "Kebab-case identifier for the new protocol, e.g. 'oxygen-check', 'tank-cleaning'",
        },
        title: {
          type: Type.STRING,
          description: "Title of the protocol",
        },
        category: {
          type: Type.STRING,
          description:
            "Protocol category: feeding, water-quality, treatments, tank-procedures, pool-procedures, transfers, monitoring, arrival, lab, other",
        },
        protocolNumber: {
          type: Type.STRING,
          description: "Protocol number like PRO.X.X.X (optional)",
        },
        frequency: {
          type: Type.STRING,
          description: "How often the protocol is performed (optional)",
        },
        body: {
          type: Type.STRING,
          description:
            "The full markdown body of the protocol. Use proper markdown with ## headings and - [ ] checkboxes.",
        },
        lang: {
          type: Type.STRING,
          description: "Language: 'he' for Hebrew (default) or 'en' for English",
        },
      },
      required: ["slug", "title", "category", "body"],
    },
  },
];

function buildMarkdownContent(
  title: string,
  category: string,
  body: string,
  protocolNumber?: string,
  frequency?: string
): string {
  const frontmatter = [
    "---",
    `title: "${title}"`,
    `category: "${category}"`,
  ];
  if (protocolNumber) frontmatter.push(`protocolNumber: "${protocolNumber}"`);
  if (frequency) frontmatter.push(`frequency: "${frequency}"`);
  frontmatter.push("---", "");

  return frontmatter.join("\n") + body;
}

export interface ToolResult {
  success: boolean;
  message: string;
  error?: string;
}

export async function editProtocol(args: {
  slug: string;
  title?: string;
  category?: string;
  protocolNumber?: string;
  frequency?: string;
  body: string;
  changeDescription: string;
  lang?: string;
}): Promise<ToolResult> {
  const lang = args.lang || "he";
  const filePath = `content/protocols/${lang}/${args.slug}.md`;

  try {
    // Get current file to retrieve sha
    const getRes = await githubRequest(`/contents/${filePath}?ref=${BRANCH}`);
    if (!getRes.ok) {
      return {
        success: false,
        message: `Protocol '${args.slug}' not found`,
        error: `HTTP ${getRes.status}`,
      };
    }

    const fileData = await getRes.json();
    const currentContent = Buffer.from(fileData.content, "base64").toString("utf-8");

    // Parse current frontmatter to preserve values not being changed
    const frontmatterMatch = currentContent.match(/^---\n([\s\S]*?)\n---/);
    let currentTitle = args.slug;
    let currentCategory = "other";
    let currentProtocolNumber: string | undefined;
    let currentFrequency: string | undefined;

    if (frontmatterMatch) {
      const fm = frontmatterMatch[1];
      const titleMatch = fm.match(/title:\s*"([^"]+)"/);
      const catMatch = fm.match(/category:\s*"([^"]+)"/);
      const numMatch = fm.match(/protocolNumber:\s*"([^"]+)"/);
      const freqMatch = fm.match(/frequency:\s*"([^"]+)"/);

      if (titleMatch) currentTitle = titleMatch[1];
      if (catMatch) currentCategory = catMatch[1];
      if (numMatch) currentProtocolNumber = numMatch[1];
      if (freqMatch) currentFrequency = freqMatch[1];
    }

    const newContent = buildMarkdownContent(
      args.title || currentTitle,
      args.category || currentCategory,
      args.body,
      args.protocolNumber ?? currentProtocolNumber,
      args.frequency ?? currentFrequency
    );

    // Update file
    const putRes = await githubRequest(`/contents/${filePath}`, {
      method: "PUT",
      body: JSON.stringify({
        message: args.changeDescription,
        content: Buffer.from(newContent).toString("base64"),
        sha: fileData.sha,
        branch: BRANCH,
      }),
    });

    if (!putRes.ok) {
      const error = await putRes.text();
      return {
        success: false,
        message: `Failed to update protocol`,
        error,
      };
    }

    return {
      success: true,
      message: `Updated protocol '${args.slug}': ${args.changeDescription}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error editing protocol`,
      error: String(error),
    };
  }
}

export async function createProtocol(args: {
  slug: string;
  title: string;
  category: string;
  protocolNumber?: string;
  frequency?: string;
  body: string;
  lang?: string;
}): Promise<ToolResult> {
  const lang = args.lang || "he";
  const filePath = `content/protocols/${lang}/${args.slug}.md`;

  // Validate category
  if (!VALID_CATEGORIES.includes(args.category as typeof VALID_CATEGORIES[number])) {
    return {
      success: false,
      message: `Invalid category '${args.category}'`,
      error: `Must be one of: ${VALID_CATEGORIES.join(", ")}`,
    };
  }

  try {
    // Check if file already exists
    const checkRes = await githubRequest(`/contents/${filePath}?ref=${BRANCH}`);
    if (checkRes.ok) {
      return {
        success: false,
        message: `Protocol '${args.slug}' already exists`,
        error: "Use edit_protocol to modify existing protocols",
      };
    }

    const content = buildMarkdownContent(
      args.title,
      args.category,
      args.body,
      args.protocolNumber,
      args.frequency
    );

    // Create file
    const putRes = await githubRequest(`/contents/${filePath}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Create protocol: ${args.title}`,
        content: Buffer.from(content).toString("base64"),
        branch: BRANCH,
      }),
    });

    if (!putRes.ok) {
      const error = await putRes.text();
      return {
        success: false,
        message: `Failed to create protocol`,
        error,
      };
    }

    return {
      success: true,
      message: `Created new protocol '${args.slug}': ${args.title}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error creating protocol`,
      error: String(error),
    };
  }
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  switch (name) {
    case "edit_protocol":
      return editProtocol(args as Parameters<typeof editProtocol>[0]);
    case "create_protocol":
      return createProtocol(args as Parameters<typeof createProtocol>[0]);
    default:
      return {
        success: false,
        message: `Unknown tool: ${name}`,
      };
  }
}
