// ABOUTME: API route for single protocol operations
// ABOUTME: Handles GET and PUT for individual protocols

import { NextRequest, NextResponse } from "next/server";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "he";
  try {
    const res = await githubRequest(`/contents/content/protocols/${lang}/${slug}.md`);
    if (!res.ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const data = await res.json();
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return NextResponse.json({ slug, sha: data.sha, content, lang });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const { content, sha, message, lang = "he" } = await request.json();

    const res = await githubRequest(`/contents/content/protocols/${lang}/${slug}.md`, {
      method: "PUT",
      body: JSON.stringify({
        message: message || `Update ${slug}`,
        content: Buffer.from(content).toString("base64"),
        sha,
        branch: BRANCH,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, sha: data.content.sha });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
