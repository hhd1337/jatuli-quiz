import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "./MarkdownContent.css";

export default function MarkdownContent({ value }) {
    const markdown = typeof value === "string" ? value : "";

    if (!markdown.trim()) {
        return <span style={{ opacity: 0.6 }}>내용이 없습니다.</span>;
    }

    return (
        <div className="markdown-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    a({ href, children, ...props }) {
                        return (
                            <a
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                {...props}
                            >
                                {children}
                            </a>
                        );
                    },
                }}
            >
                {markdown}
            </ReactMarkdown>
        </div>
    );
}