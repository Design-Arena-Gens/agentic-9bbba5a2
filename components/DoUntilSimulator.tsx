'use client';
import { useMemo, useState } from 'react';

type TraceItem = {
  iteration: number;
  value: number;
  conditionResult: boolean;
};

function safeEvalCondition(value: number, conditionExpr: string): boolean {
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('x', `return Boolean(${conditionExpr});`);
    return Boolean(fn(value));
  } catch {
    return false;
  }
}

function safeEvalUpdate(value: number, updateExpr: string): number {
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('x', `return (${updateExpr});`);
    const result = fn(value);
    return Number.isFinite(result) ? Number(result) : value;
  } catch {
    return value;
  }
}

export default function DoUntilSimulator() {
  const [start, setStart] = useState<number>(1);
  const [condition, setCondition] = useState<string>('x > 5');
  const [update, setUpdate] = useState<string>('x + 1');
  const [maxIters, setMaxIters] = useState<number>(100);

  const { trace, finalValue, stoppedByCondition, truncated } = useMemo(() => {
    const steps: TraceItem[] = [];
    let x = start;
    let iteration = 0;
    let didStop = false;
    let didTruncate = false;

    while (true) {
      iteration += 1;
      const cond = safeEvalCondition(x, condition);
      steps.push({ iteration, value: x, conditionResult: cond });
      if (cond) {
        didStop = true;
        break;
      }
      x = safeEvalUpdate(x, update);
      if (iteration >= maxIters) {
        didTruncate = true;
        break;
      }
    }

    return {
      trace: steps,
      finalValue: steps[steps.length - 1]?.value ?? x,
      stoppedByCondition: didStop,
      truncated: didTruncate
    };
  }, [start, condition, update, maxIters]);

  return (
    <div className="simulator">
      <div className="grid">
        <label className="field">
          <span>?????? ?????????? (x):</span>
          <input
            type="number"
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
          />
        </label>

        <label className="field">
          <span>????? (????? ??? ?????):</span>
          <input
            type="text"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="????: x > 5"
          />
        </label>

        <label className="field">
          <span>????? x ?? ?? ????:</span>
          <input
            type="text"
            value={update}
            onChange={(e) => setUpdate(e.target.value)}
            placeholder="????: x + 1"
          />
        </label>

        <label className="field">
          <span>?? ???? ??????? (????):</span>
          <input
            type="number"
            value={maxIters}
            onChange={(e) => setMaxIters(Number(e.target.value))}
            min={1}
          />
        </label>
      </div>

      <div className="summary">
        <strong>?????? ???????? (x):</strong> {finalValue}{' '}
        <span className={`pill ${stoppedByCondition ? 'ok' : 'warn'}`}>
          {stoppedByCondition ? '???? ??? ???? ?????' : '?? ????? ????? ???'}
        </span>
        {truncated && (
          <span className="pill warn">?? ??????? ????? ???? ?????? ???????</span>
        )}
      </div>

      <details className="trace">
        <summary>????? ???????</summary>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>???? x ??? ?????</th>
              <th>?? ????? ?????</th>
            </tr>
          </thead>
          <tbody>
            {trace.map((t) => (
              <tr key={t.iteration}>
                <td>{t.iteration}</td>
                <td>{t.value}</td>
                <td>{t.conditionResult ? '???' : '??'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <div className="note">
        ??????? ????????: <code>{`do { ... } while (!(?????))`}</code> ? ?? ?????
        ?? ??? ????? ??? ??????? ?????? ????? ???? ????? ??????.
      </div>
    </div>
  );
}

