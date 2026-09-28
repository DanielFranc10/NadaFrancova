export async function onRequest(context) {
    const { request, env } = context;

    if (!env.BLOG_KV) {
        return new Response(JSON.stringify({ error: "KV namespace BLOG_KV neni propojen." }), { status: 500 });
    }

    if (request.method === "GET") {
        const data = await env.BLOG_KV.get("blogs_data");
        return new Response(data || "[]", { 
            headers: { "Content-Type": "application/json" } 
        });
    }

    if (request.method === "POST") {
        const body = await request.json();
        let data = await env.BLOG_KV.get("blogs_data");
        let blogs = data ? JSON.parse(data) : [];

        if (body.action === "add") {
            blogs.push(body.blog);
        } else if (body.action === "delete") {
            blogs = blogs.filter(b => b.id !== body.id);
        }

        await env.BLOG_KV.put("blogs_data", JSON.stringify(blogs));
        return new Response(JSON.stringify({ success: true }), { 
            headers: { "Content-Type": "application/json" } 
        });
    }

    return new Response("Method Not Allowed", { status: 405 });
}
