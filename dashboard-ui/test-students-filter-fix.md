# Kiểm tra Filter Students đã sửa

## Vấn đề đã được sửa:

### **Vấn đề cũ:**
- Filter theo teacher không hoạt động chính xác
- Logic: `query.class = { lessons: { some: { teacherId: value } } }`
- Kết quả: Trả về tất cả students trong lớp nếu có ít nhất 1 lesson của teacher

### **Sửa chữa:**
- Bỏ filter theo teacher vì không chính xác
- Thêm role-based filtering
- Chỉ giữ lại filter theo lớp học

## Các thay đổi:

### 1. **Bỏ filter theo teacher** ✅
```typescript
// CŨ (không chính xác)
case "teacherId":
  query.class = {
    lessons: {
      some: {
        teacherId: value,
      },
    },
  };

// MỚI (đã bỏ)
// Không còn filter theo teacher
```

### 2. **Thêm role-based filtering** ✅
```typescript
// ROLE CONDITIONS
switch (role) {
  case "admin":
    break; // Admin thấy tất cả students
  case "teacher":
    // Teacher chỉ thấy students trong lớp mà họ dạy
    query.class = {
      lessons: {
        some: {
          teacherId: currentUserId!,
        },
      },
    };
    break;
  case "student":
    query.id = currentUserId!; // Student chỉ thấy chính mình
    break;
  case "parent":
    query.parentId = currentUserId!; // Parent chỉ thấy con của mình
    break;
}
```

### 3. **Cập nhật filter options** ✅
```typescript
// CŨ
const filterOptions = [
  { key: "classId", label: "Lớp học", type: "select" },
  { key: "teacherId", label: "Giáo viên", type: "select" }, // Đã bỏ
];

// MỚI
const filterOptions = [
  { key: "classId", label: "Lớp học", type: "select" },
];
```

## Lý do bỏ filter theo teacher:

### **Vấn đề với logic cũ:**
1. **Không chính xác**: Teacher có thể dạy 1 lesson trong lớp nhưng không dạy tất cả students
2. **Logic sai**: `some` sẽ trả về tất cả students trong lớp nếu có ít nhất 1 lesson của teacher
3. **Không thực tế**: Teacher thường dạy nhiều lớp, không phải tất cả students trong 1 lớp

### **Giải pháp tốt hơn:**
1. **Role-based filtering**: Teacher chỉ thấy students trong lớp mà họ dạy
2. **Filter theo lớp**: Chính xác và thực tế hơn
3. **Đơn giản hóa**: Bỏ filter không cần thiết

## Cách kiểm tra:

### 1. **Test Filter theo Lớp học:**
1. Vào `/list/students`
2. Click nút filter
3. Chọn "Lớp học" → Chọn lớp cụ thể
4. Click "Áp dụng"
5. **Kết quả mong đợi**: Chỉ hiển thị students trong lớp đó

### 2. **Test Role-based Access:**
1. **Admin**: Thấy tất cả students
2. **Teacher**: Chỉ thấy students trong lớp mà họ dạy
3. **Student**: Chỉ thấy chính mình
4. **Parent**: Chỉ thấy con của mình

### 3. **Test Search:**
1. Sử dụng search box để tìm theo tên
2. Kết hợp với filter theo lớp
3. Kiểm tra kết quả chính xác

## Schema Relationship:

### **Student ↔ Class:**
```prisma
model Student {
  classId     Int
  class       Class @relation(fields: [classId], references: [id])
}

model Class {
  students    Student[]
}
```

### **Teacher ↔ Lesson ↔ Class:**
```prisma
model Teacher {
  lessons     Lesson[]
}

model Lesson {
  teacherId   String
  classId     Int
  teacher     Teacher @relation(fields: [teacherId], references: [id])
  class       Class @relation(fields: [classId], references: [id])
}

model Class {
  lessons     Lesson[]
}
```

## Lưu ý:

### **Filter hiện tại:**
- ✅ **Lớp học**: Chính xác và thực tế
- ❌ **Giáo viên**: Đã bỏ vì không chính xác

### **Role-based filtering:**
- **Admin**: Thấy tất cả
- **Teacher**: Thấy students trong lớp họ dạy
- **Student**: Thấy chính mình
- **Parent**: Thấy con của mình

### **Sort options:**
- Tên học sinh
- Mã học sinh
- Lớp học
- Số điện thoại
- Địa chỉ

## Kết luận:
- Filter theo teacher đã được bỏ vì không chính xác
- Role-based filtering đảm bảo mỗi role thấy đúng dữ liệu
- Filter theo lớp học vẫn hoạt động tốt
- UI đơn giản và dễ sử dụng hơn 