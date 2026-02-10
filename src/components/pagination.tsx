interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-6">
      {currentPage > 1 ? (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50"
        >
          Previous
        </button>
      ) : (
        <div />
      )}
      <span className="text-xs text-gray-400">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages ? (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50"
        >
          Next
        </button>
      ) : (
        <div />
      )}
    </div>
  );
}
