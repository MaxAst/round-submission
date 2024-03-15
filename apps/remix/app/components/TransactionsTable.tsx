import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import { useMemo } from "react";

const columnHelper = createColumnHelper<{
  date: string;
  payer: string;
  payee: string;
  amount: string;
  paymentMethod: string;
  bank: string;
  accountName: string;
}>();

const columns = [
  columnHelper.accessor("date", {
    cell: (info) => dayjs(info.getValue()).format("DD MMM YYYY, HH:mm A"),
    header: "Date",
  }),
  columnHelper.accessor(
    (row) => (parseFloat(row.amount) < 0 ? row.payee : row.payer),
    {
      cell: (info) => info.getValue(),
      header: "To/From",
    }
  ),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor("paymentMethod", {
    header: "Payment Method",
    cell: (info) => "Credit Card",
  }),
  columnHelper.accessor("bank", {
    header: "Bank",
    cell: () => "JP Morgan Chase",
  }),
  columnHelper.accessor("accountName", {
    header: "Account",
    cell: (info) => info.renderValue(),
  }),
];

export const TransactionsTable = ({ transactions }: { transactions: any }) => {
  const data = useMemo(() => transactions.slice(0, 100), [transactions]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-2">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 overflow-hidden overflow-ellipsis max-w-[200px]"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
