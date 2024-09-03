import { useState } from "react";

export const usePagination = (totalRecords: number, recordsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const paginatedFiles = (files: any[]) =>
    files.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return {
    currentPage,
    totalPages,
    paginatedFiles,
    goToNextPage,
    goToPreviousPage,
  };
};
