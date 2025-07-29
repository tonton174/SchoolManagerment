import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FilterSortGenericButtons from "@/components/FilterSortGenericButtons";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Parent, Prisma, Student } from "@prisma/client";
import Image from "next/image";

import { auth } from "@clerk/nextjs/server";

type ParentList = Parent & { students: Student[] };

const ParentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = sessionClaims?.sub;

  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Student Names",
      accessor: "students",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: ParentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">
        {item.students.map((student) => student.name).join(",")}
      </td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="parent" type="update" data={item} />
              <FormContainer table="parent" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.ParentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.students = {
              some: {
                classId: parseInt(value),
              },
            };
            break;
          case "studentId":
            query.students = {
              some: {
                id: value,
              },
            };
            break;
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS
  switch (role) {
    case "admin":
      break;
    case "teacher":
      // Teacher chỉ thấy parents của students trong lớp họ dạy
      query.students = {
        some: {
          class: {
            lessons: {
              some: {
                teacherId: currentUserId!,
              },
            },
          },
        },
      };
      break;
    case "student":
      // Student không thấy parents
      query.id = "none";
      break;
    case "parent":
      // Parent chỉ thấy chính mình
      query.id = currentUserId!;
      break;
    default:
      break;
  }

  // SORT LOGIC
  let orderBy: any = { name: "asc" }; // default sort

  const sortBy = queryParams.sortBy;
  const sortOrder = queryParams.sortOrder || "asc";

  if (sortBy) {
    switch (sortBy) {
      case "name":
        orderBy = { name: sortOrder };
        break;
      case "email":
        orderBy = { email: sortOrder };
        break;
      case "phone":
        orderBy = { phone: sortOrder };
        break;
      case "address":
        orderBy = { address: sortOrder };
        break;
      default:
        orderBy = { name: "asc" };
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
      include: {
        students: true,
      },
      orderBy: orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.parent.count({ where: query }),
  ]);

  // Filter and sort options
  const filterOptions = [
    {
      key: "classId",
      label: "Lớp học của con",
      type: "select" as const,
    },
    ...(role === "admin" ? [
      {
        key: "studentId",
        label: "Học sinh",
        type: "select" as const,
      },
    ] : []),
  ];

  const sortOptions = [
    { key: "name", label: "Tên phụ huynh" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Số điện thoại" },
    { key: "address", label: "Địa chỉ" },
  ];

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Parents</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch value="" onChange={() => {}} />
          <div className="flex items-center gap-4 self-end">
            <FilterSortGenericButtons 
              table="parents"
              filterOptions={filterOptions}
              sortOptions={sortOptions}
            />
            {role === "admin" && <FormContainer table="parent" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ParentListPage;