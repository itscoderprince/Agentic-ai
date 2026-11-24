import { memo, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { highlightCode } from "@/lib/highlighter";
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockContent,
} from "@/components/ui/code-block";

function formatCellContent(children) {
  if (typeof children === "string" && /<br\s*\/?>/i.test(children)) {
    return children.split(/<br\s*\/?>/i).map((part, index) => (
      <span key={index}>
        {index > 0 && <br />}
        {part}
      </span>
    ));
  }
  if (Array.isArray(children)) {
    return children.map((child, index) => (
      <span key={index}>{formatCellContent(child)}</span>
    ));
  }
  return children;
}

function HighlightedCode({ code, language }) {
  const [tokens, setTokens] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (language) {
      highlightCode(code, language)
        .then((lines) => {
          if (mounted && lines) {
            setTokens(lines);
          }
        })
        .catch(() => {});
    }
    return () => {
      mounted = false;
    };
  }, [code, language]);

  if (!tokens) {
    return code;
  }

  return (
    <>
      {tokens.map((line, lineIdx) => (
        <span key={lineIdx} className="line block min-h-[1.5em]">
          {line.length === 0 ? "\u00A0" : line}
        </span>
      ))}
    </>
  );
}

const markdownComponents = {
  table({ children }) {
    return (
      <div className="my-4 w-full min-w-0 overflow-x-auto rounded-xl border border-border/70 dark:border-neutral-700/80 bg-secondary/15 dark:bg-neutral-900/40">
        <table className="w-full min-w-full text-[14px] sm:text-[15px] leading-normal text-left border-collapse">
          {children}
        </table>
      </div>
    );
  },
  thead({ children }) {
    return (
      <thead className="bg-secondary/60 dark:bg-neutral-800/80 text-foreground border-b border-border/70 dark:border-neutral-700/80">
        {children}
      </thead>
    );
  },
  th({ children }) {
    return (
      <th className="px-4 py-3 font-semibold text-foreground border-r border-border/40 dark:border-neutral-700/50 last:border-r-0 whitespace-nowrap">
        {children}
      </th>
    );
  },
  tbody({ children }) {
    return (
      <tbody className="divide-y divide-border/40 dark:divide-neutral-700/50">
        {children}
      </tbody>
    );
  },
  tr({ children }) {
    return <tr className="hover:bg-muted/20 dark:hover:bg-neutral-800/30 transition-colors">{children}</tr>;
  },
  td({ children }) {
    return (
      <td className="px-4 py-3 text-foreground/90 border-r border-border/40 dark:border-neutral-700/50 last:border-r-0 align-top">
        {formatCellContent(children)}
      </td>
    );
  },
  h1({ children }) {
    return <h1 className="text-2xl font-bold mt-6 mb-3 text-foreground tracking-tight">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-xl font-bold mt-5 mb-2.5 text-foreground tracking-tight">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h3>;
  },
  p({ children }) {
    return <p className="mb-4 last:mb-0 leading-[1.8]">{children}</p>;
  },
  ul({ children }) {
    return <ul className="list-disc pl-6 space-y-1.5 mb-4 leading-[1.8]">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal pl-6 space-y-1.5 mb-4 leading-[1.8]">{children}</ol>;
  },
  li({ children }) {
    return <li className="marker:text-muted-foreground">{children}</li>;
  },
  hr() {
    return <hr className="my-6 border-border/60" />;
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-2 border-primary/50 pl-4 my-4 italic text-muted-foreground">
        {children}
      </blockquote>
    );
  },
  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-blue-500 hover:underline underline-offset-4"
      >
        {children}
      </a>
    );
  },
  pre({ children }) {
    return <>{children}</>;
  },
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children).replace(/\n$/, "");
    const isMultiline = codeString.includes("\n") || match;

    if (!isMultiline) {
      return (
        <code
          className="px-1.5 py-0.5 rounded-md bg-muted dark:bg-neutral-800 text-[0.875em] font-mono font-medium text-foreground border border-border/40"
          {...props}
        >
          {children}
        </code>
      );
    }

    const language = match?.[1] || "code";

    return (
      <CodeBlock className="my-4 border border-border/70 dark:border-neutral-700/80 bg-secondary/20 dark:bg-neutral-900/80 rounded-xl overflow-hidden shadow-2xs">
        <CodeBlockHeader className="flex items-center justify-between px-3.5 py-2 border-b border-border/40 dark:border-neutral-800 bg-muted/40 dark:bg-neutral-800/60">
          <CodeBlockTitle className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
            {language}
          </CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton value={codeString} className="size-7 rounded-md hover:bg-muted dark:hover:bg-neutral-700/60" />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent className="p-3.5 text-[13.5px] font-mono leading-relaxed overflow-x-auto custom-scrollbar">
          <HighlightedCode code={codeString} language={match?.[1] || ""} />
        </CodeBlockContent>
      </CodeBlock>
    );
  },
};

export const AssistantMarkdown = memo(function AssistantMarkdown({ content }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  );
});

export default AssistantMarkdown;

