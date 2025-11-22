type Props = {
  language: string;
  code: string;
};

export default function CodeExample({ language, code }: Props) {
  return (
    <div className="code-example">
      <div className="code-header">
        <span className="badge">{language}</span>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

