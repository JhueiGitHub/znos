"use client";

import React from "react";
import { useStyles } from "@/app/hooks/useStyles";
import { useStellarStore } from "../stores/stellar-store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function StellarBreadcrumb() {
  const { getColor } = useStyles();
  const { currentPath } = useStellarStore();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {currentPath.map((item, index) => {
          const isLast = index === currentPath.length - 1;

          return (
            <React.Fragment key={item}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-[#636464] text-sm">
                    {item}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href="#"
                    className="text-[#cccccc]/90 text-sm"
                  >
                    {item}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
