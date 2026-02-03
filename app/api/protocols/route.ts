// ABOUTME: API routes for protocol CRUD operations
// ABOUTME: Uses GitHub API to read/write protocol files

import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "he";

    const res = await githubRequest(`/contents/content/protocols/${lang}`);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
    const files = await res.json();

    const protocols = await Promise.all(
      files
        .filter((f: { name: string }) => f.name.endsWith(".md"))
        .map(async (f: { name: string; sha: string }) => {
          const contentRes = await githubRequest(`/contents/content/protocols/${lang}/${f.name}`);
          const data = await contentRes.json();
          const content = Buffer.from(data.content, "base64").toString("utf-8");
          return {
            slug: f.name.replace(".md", ""),
            sha: data.sha,
            content,
            lang,
          };
        })
    );

    return NextResponse.json(protocols);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
