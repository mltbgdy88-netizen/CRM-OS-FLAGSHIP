interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  testId?: string;
}

/** Bitrix24-style skeleton rows while entity list loads. */
export function TableSkeleton({ rows = 6, columns = 4, testId = 'table-skeleton' }: TableSkeletonProps) {
  return (
    <div className="table-skeleton" data-testid={testId} aria-hidden>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="table-skeleton__row">
          <span className="table-skeleton__checkbox" />
          <span className="table-skeleton__avatar" />
          {Array.from({ length: columns }).map((__, colIndex) => (
            <span
              key={colIndex}
              className="table-skeleton__bar"
              style={{ width: `${55 + ((rowIndex + colIndex) % 3) * 12}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
