"use client";

function buildPageNumbers(currentPage: number, totalPages: number) {
  let startPage: number;
  let endPage: number;

  if (currentPage <= 5) {
    startPage = 1;
    endPage = Math.min(totalPages, 10);
  } else if (currentPage > totalPages - 5) {
    startPage = Math.max(1, totalPages - 9);
    endPage = totalPages;
  } else {
    startPage = Math.max(1, currentPage - 4);
    endPage = Math.min(totalPages, currentPage + 5);
  }

  const pages: number[] = [];
  for (let page = startPage; page <= endPage; page++) pages.push(page);
  return pages;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 0) return null;

  function goToPage(targetPage: number) {
    if (targetPage < 1 || targetPage > totalPages || targetPage === page) return;
    onPageChange(targetPage);
  }

  return (
    <div className="mt-8 flex justify-center">
      <nav aria-label="Paginación">
        <ul className="flex items-center gap-1">
          <li>
            <button
              type="button"
              aria-label="Anterior"
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
              className="rounded px-3 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              «
            </button>
          </li>

          {buildPageNumbers(page, totalPages).map((pageNumber) => (
            <li key={pageNumber}>
              <button
                type="button"
                onClick={() => goToPage(pageNumber)}
                className={`rounded px-3 py-2 text-sm font-bold ${
                  pageNumber === page
                    ? "bg-[#0d8cff] text-white"
                    : "text-black hover:bg-slate-100"
                }`}
              >
                {pageNumber}
              </button>
            </li>
          ))}

          <li>
            <button
              type="button"
              aria-label="Siguiente"
              disabled={page === totalPages}
              onClick={() => goToPage(page + 1)}
              className="rounded px-3 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              »
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
