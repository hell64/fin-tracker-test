"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { useQueryState } from "nuqs";

type PaginationProps = {
  page: number;
  //   total: number;
  onPageChange: (page: number) => void;
};

export function PaginationDemo({ page, onPageChange }: PaginationProps) {
  //   const [page, setPage] = useQueryState("page", { defaultValue: 1 });
  //   const [limit, setLimit] = useQueryState("limit", { defaultValue: 10 });
  //   const [total, setTotal] = useQueryState("total", { defaultValue: 0 });

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
