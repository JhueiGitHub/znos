import { motion } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function StellarView() {
  const { getColor, getFont } = useStyles();

  return (
    <ScrollArea className="flex-1">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex flex-col"
      >
        {/* Breadcrumb */}
        <div
          className="flex items-center px-4 h-12 border-b"
          style={{
            backgroundColor: getColor("Glass"),
            borderColor: "rgba(255, 255, 255, 0.09)",
          }}
        >
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  style={{
                    color: getColor("Text Primary (Hd)"),
                    fontFamily: getFont("Text Primary"),
                  }}
                >
                  Stellar
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage
                  style={{
                    color: getColor("Text Secondary (Bd)"),
                    fontFamily: getFont("Text Secondary"),
                  }}
                >
                  All Files
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Files grid */}
        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-5 gap-4">
            {/* Placeholder items */}
            {[...Array(10)].map((_, i) => (
              <div key={i}>File {i + 1}</div>
            ))}
          </div>
        </ScrollArea>
      </motion.div>
    </ScrollArea>
  );
}
