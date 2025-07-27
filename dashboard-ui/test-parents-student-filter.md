# Kiểm tra Filter theo Học sinh cho Role Admin ở trang Parents

## Tính năng mới đã thêm:

### **Filter theo Học sinh cho Role Admin** ✅
- **Chỉ hiển thị cho role admin**
- **Cho phép chọn học sinh cụ thể**
- **Hiển thị parent của học sinh được chọn**

## Các thay đổi đã thực hiện:

### 1. **Thêm logic filter theo studentId** ✅
```typescript
case "studentId":
  query.students = {
    some: {
      id: value,
    },
  };
  break;
```

### 2. **Cập nhật filter options** ✅
```typescript
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
```

## Cách hoạt động:

### **Cho Role Admin:**
1. **Filter theo Lớp học**: Hiển thị tất cả parents có con trong lớp đó
2. **Filter theo Học sinh**: Hiển thị parent của học sinh cụ thể
3. **Kết hợp cả hai**: Có thể kết hợp filter theo lớp và học sinh

### **Cho Role khác:**
- **Teacher**: Chỉ thấy filter theo lớp học
- **Student**: Không thấy filter nào
- **Parent**: Chỉ thấy filter theo lớp học

## Cách kiểm tra:

### 1. **Test với Role Admin:**
1. Đăng nhập với role admin
2. Vào `/list/parents`
3. Click nút filter
4. **Kết quả mong đợi**: Thấy 2 filter options:
   - "Lớp học của con"
   - "Học sinh" (mới thêm)

### 2. **Test Filter theo Học sinh:**
1. Chọn "Học sinh" trong dropdown
2. Chọn một học sinh cụ thể
3. Click "Áp dụng"
4. **Kết quả mong đợi**: Chỉ hiển thị parent của học sinh đó

### 3. **Test kết hợp Filter:**
1. Chọn "Lớp học của con" → Chọn lớp
2. Chọn "Học sinh" → Chọn học sinh trong lớp đó
3. Click "Áp dụng"
4. **Kết quả mong đợi**: Hiển thị parent của học sinh đó (nếu học sinh thuộc lớp đã chọn)

### 4. **Test với Role khác:**
1. Đăng nhập với role teacher/student/parent
2. Vào `/list/parents`
3. Click nút filter
4. **Kết quả mong đợi**: Chỉ thấy filter "Lớp học của con", không thấy "Học sinh"

## Schema Relationship:

### **Parent ↔ Student:**
```prisma
model Parent {
  id        String
  students  Student[]
}

model Student {
  id        String
  parentId  String
  parent    Parent @relation(fields: [parentId], references: [id])
}
```

## Logic Filter:

### **Filter theo StudentId:**
```typescript
query.students = {
  some: {
    id: value, // studentId từ URL params
  },
};
```

### **Kết hợp với Role-based Filtering:**
```typescript
// ROLE CONDITIONS
switch (role) {
  case "admin":
    break; // Thấy tất cả + có thêm filter theo học sinh
  case "teacher":
    // Chỉ thấy parents của students trong lớp họ dạy
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
    query.id = "none"; // Không thấy parents
    break;
  case "parent":
    query.id = currentUserId!; // Chỉ thấy chính mình
    break;
}
```

## API Support:

### **Filter Data API:**
```typescript
// /api/filter-data?type=students
case "students":
  const students = await prisma.student.findMany({
    select: { id: true, name: true, surname: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ students });
```

## Lưu ý:

### **UI/UX:**
- Filter "Học sinh" chỉ hiển thị cho admin
- Có thể kết hợp với filter "Lớp học của con"
- Dropdown hiển thị tên học sinh (name + surname)
- URL persistence hoạt động cho filter mới

### **Performance:**
- API call để lấy danh sách học sinh
- Prisma query tối ưu với `some` relationship
- Lazy loading cho dropdown data

### **Security:**
- Chỉ admin mới thấy filter này
- Role-based access control vẫn hoạt động
- Không ảnh hưởng đến các role khác

## Kết quả mong đợi:

### **Admin có thể:**
- ✅ Filter theo lớp học của con
- ✅ Filter theo học sinh cụ thể (mới)
- ✅ Kết hợp cả hai filter
- ✅ Sort theo tên, email, phone, address

### **Các role khác:**
- ✅ Teacher: Chỉ thấy filter theo lớp
- ✅ Student: Không thấy filter nào
- ✅ Parent: Chỉ thấy filter theo lớp

## Test Cases:

### **Test Case 1: Admin Filter theo Học sinh**
1. Admin chọn học sinh "Nguyễn Văn A"
2. Kết quả: Hiển thị parent của học sinh A

### **Test Case 2: Admin Kết hợp Filter**
1. Admin chọn lớp "3A"
2. Admin chọn học sinh "Nguyễn Văn A" (trong lớp 3A)
3. Kết quả: Hiển thị parent của học sinh A

### **Test Case 3: Teacher không thấy Filter Học sinh**
1. Teacher vào trang parents
2. Kết quả: Chỉ thấy filter "Lớp học của con"

### **Test Case 4: URL Persistence**
1. Admin filter theo học sinh
2. URL: `/list/parents?studentId=student123`
3. Refresh trang
4. Kết quả: Filter vẫn được áp dụng 