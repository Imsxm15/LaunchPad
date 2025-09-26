import React from 'react';

type RichTextNode = {
  id?: string | number;
  type?: string;
  level?: number;
  format?: string;
  url?: string;
  text?: string;
  children?: RichTextNode[];
  [key: string]: any;
};

function resolveHeadingLevel(node: RichTextNode): keyof JSX.IntrinsicElements {
  if (typeof node.level === 'number') {
    const level = Math.min(Math.max(node.level, 1), 6);
    return `h${level}` as keyof JSX.IntrinsicElements;
  }

  const match = node.type?.match(/heading[-_]?([a-z]+)/i);
  if (match) {
    const map: Record<string, number> = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
    };
    const level = map[match[1]?.toLowerCase() ?? ''] ?? 2;
    return `h${level}` as keyof JSX.IntrinsicElements;
  }

  return 'h2';
}

function renderInline(nodes: RichTextNode[] = []): React.ReactNode {
  return nodes.map((child, index) => {
    if (child.type === 'link' && child.url) {
      return (
        <a
          key={`link-${index}`}
          href={child.url}
          target={child.openInNewTab ? '_blank' : undefined}
          rel="noreferrer"
        >
          {renderInline(child.children)}
        </a>
      );
    }

    if (child.children && child.children.length > 0) {
      return (
        <React.Fragment key={`fragment-${index}`}>
          {renderInline(child.children)}
        </React.Fragment>
      );
    }

    if (typeof child.text === 'string') {
      const classNames = [
        child.bold ? 'font-semibold' : '',
        child.italic ? 'italic' : '',
        child.underline ? 'underline' : '',
        child.strikethrough ? 'line-through' : '',
        child.code ? 'font-mono bg-neutral-900 px-1 py-0.5 rounded' : '',
      ]
        .filter(Boolean)
        .join(' ');

      if (!child.text) {
        return <React.Fragment key={`text-${index}`} />;
      }

      return (
        <span key={`text-${index}`} className={classNames || undefined}>
          {child.text}
        </span>
      );
    }

    return <React.Fragment key={`unknown-${index}`} />;
  });
}

function renderNode(node: RichTextNode, index: number): React.ReactNode {
  const key = node.id ?? index;

  switch (node.type) {
    case 'paragraph':
      return <p key={key}>{renderInline(node.children)}</p>;
    case 'heading':
    case 'heading-one':
    case 'heading-two':
    case 'heading-three':
    case 'heading-four':
    case 'heading-five':
    case 'heading-six': {
      const HeadingTag = resolveHeadingLevel(node);
      return <HeadingTag key={key}>{renderInline(node.children)}</HeadingTag>;
    }
    case 'list': {
      const ListTag = node.format === 'ordered' ? 'ol' : 'ul';
      return (
        <ListTag key={key}>
          {(node.children ?? []).map((child, childIndex) =>
            renderNode(child, childIndex)
          )}
        </ListTag>
      );
    }
    case 'list-item':
      return <li key={key}>{renderInline(node.children)}</li>;
    case 'quote':
    case 'blockquote':
      return <blockquote key={key}>{renderInline(node.children)}</blockquote>;
    case 'code':
      return (
        <pre key={key}>
          <code>{renderInline(node.children)}</code>
        </pre>
      );
    case 'link':
      return (
        <a
          key={key}
          href={node.url}
          target={node.openInNewTab ? '_blank' : undefined}
          rel="noreferrer"
        >
          {renderInline(node.children)}
        </a>
      );
    default:
      if (Array.isArray(node.children)) {
        return (
          <div key={key}>
            {node.children.map((child, childIndex) =>
              renderNode(child, childIndex)
            )}
          </div>
        );
      }
      return <React.Fragment key={key} />;
  }
}

export function BlocksRenderer({
  content,
}: {
  content: RichTextNode[] | RichTextNode | null;
}) {
  if (!content) {
    return null;
  }

  const nodes = Array.isArray(content) ? content : [content];

  return <>{nodes.map((node, index) => renderNode(node, index))}</>;
}
