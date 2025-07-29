import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearchWrapper from "@/components/TableSearchWrapper";
import FilterSortGenericButtons from "@/components/FilterSortGenericButtons";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Announcement, Class, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type AnnouncementList = Announcement & { class: Class };

const AnnouncementListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
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

  const renderRow = (item: AnnouncementList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>{item.class?.name || "-"}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.date)}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="announcement" type="update" data={item} />
              <FormContainer table="announcement" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.AnnouncementWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.classId = parseInt(value);
            break;
          case "startDate":
            query.date = {
              gte: new Date(value),
            };
            break;
          case "endDate":
            if (query.date && typeof query.date === 'object' && 'gte' in query.date) {
              query.date = {
                ...query.date,
                lte: new Date(value),
              };
            } else {
              query.date = {
                lte: new Date(value),
              };
            }
            break;
          case "search":
            query.title = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS

  const roleConditions = {
    teacher: { lessons: { some: { teacherId: currentUserId! } } },
    student: { students: { some: { id: currentUserId! } } },
    parent: { students: { some: { parentId: currentUserId! } } },
  };

  query.OR = [
    { classId: null },
    {
      class: roleConditions[role as keyof typeof roleConditions] || {},
    },
  ];

  // SORT LOGIC
  let orderBy: any = { date: "desc" }; // default sort

  const sortBy = queryParams.sortBy;
  const sortOrder = queryParams.sortOrder || "desc";

  if (sortBy) {
    switch (sortBy) {
      case "title":
        orderBy = { title: sortOrder };
        break;
      case "date":
        orderBy = { date: sortOrder };
        break;
      case "class":
        orderBy = { class: { name: sortOrder } };
        break;
      default:
        orderBy = { date: "desc" };
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: {
        class: true,
      },
      orderBy: orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.announcement.count({ where: query }),
  ]);

  // Filter and sort options
  const filterOptions = [
    {
      key: "classId",
      label: "Lớp học",
      type: "select" as const,
    },
    {
      key: "startDate",
      label: "Từ ngày",
      type: "date" as const,
    },
    {
      key: "endDate",
      label: "Đến ngày",
      type: "date" as const,
    },
  ];

  const sortOptions = [
    { key: "title", label: "Tiêu đề" },
    { key: "date", label: "Ngày thông báo" },
    { key: "class", label: "Lớp học" },
  ];

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Announcements
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearchWrapper />
          <div className="flex items-center gap-4 self-end">
            <FilterSortGenericButtons 
              table="announcements"
              filterOptions={filterOptions}
              sortOptions={sortOptions}
            />
            {role === "admin" && (
              <FormContainer table="announcement" type="create" />
            )}
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

export default AnnouncementListPage;