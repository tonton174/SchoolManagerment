# Kiểm tra Filter Teachers đã sửa

## Vấn đề đã được sửa:

### **Vấn đề cũ:**
- Logic filter sử dụng `lessons` relationship
- Query: `query.lessons = { some: { classId: parseInt(value) } }`
- Kết quả: Hiển thị teachers không đúng với lớp được chọn

### **Sửa chữa:**
- Logic filter sử dụng `classes` relationship
- Query: `query.classes = { some: { id: parseInt(value) } }`
- Thêm role-based filtering

## Các thay đổi:

### 1. **Sửa logic filter** ✅
```typescript
// CŨ (sai)
case "classId":
  query.lessons = {
    some: {
      classId: parseInt(value),
    },
  };

// MỚI (đúng)
case "classId":
  query.classes = {
    some: {
      id: parseInt(value),
    },
  };
```

### 2. **Thêm role-based filtering** ✅
```typescript
// ROLE CONDITIONS
switch (role) {
  case "admin":
    break; // Admin thấy tất cả
  case "teacher":
    query.id = currentUserId!; // Teacher chỉ thấy chính mình
    break;
  case "student":
    // Students thấy teachers dạy lớp của họ
    query.classes = {
      some: {
        students: {
          some: {
            id: currentUserId!,
          },
        },
      },
    };
    break;
  case "parent":
    // Parents thấy teachers dạy lớp của con họ
    query.classes = {
      some: {
        students: {
          some: {
            parentId: currentUserId!,
          },
        },
      },
    };
    break;
}
```

## Cách kiểm tra:

### 1. **Test Filter theo Lớp học:**
1. Vào `/list/teachers`
2. Click nút filter
3. Chọn "Lớp học" → Chọn "3A" (hoặc lớp cụ thể)
4. Click "Áp dụng"
5. Kiểm tra URL: `?classId=3`
6. **Kết quả mong đợi**: Chỉ hiển thị teachers dạy lớp 3A

### 2. **Test Filter theo Môn học:**
1. Vào `/list/teachers`
2. Click nút filter
3. Chọn "Môn học" → Chọn "Toán"
4. Click "Áp dụng"
5. Kiểm tra URL: `?subjectId=1`
6. **Kết quả mong đợi**: Chỉ hiển thị teachers dạy môn Toán

### 3. **Test Role-based Access:**
1. **Admin**: Thấy tất cả teachers
2. **Teacher**: Chỉ thấy chính mình
3. **Student**: Chỉ thấy teachers dạy lớp của mình
4. **Parent**: Chỉ thấy teachers dạy lớp của con

### 4. **Test Combine Filter:**
1. Filter theo lớp + môn học
2. Kiểm tra kết quả đúng với cả 2 điều kiện

## Schema Relationship:

### **Teacher ↔ Class:**
```prisma
model Teacher {
  classes   Class[]  // Many-to-Many
}

model Class {
  // Không có direct relationship với Teacher
  // Chỉ có qua Lesson
}
```

### **Teacher ↔ Subject:**
```prisma
model Teacher {
  subjects  Subject[] @relation("SubjectToTeacher")
}

model Subject {
  teachers Teacher[] @relation("SubjectToTeacher")
}
```

### **Teacher ↔ Lesson:**
```prisma
model Teacher {
  lessons   Lesson[]
}

model Lesson {
  teacherId   String
  teacher     Teacher @relation(fields: [teacherId], references: [id])
}
```

## Lý do sửa:

### **Vấn đề với logic cũ:**
- `lessons` relationship không trực tiếp liên kết Teacher với Class
- Lesson có `classId` nhưng không đảm bảo Teacher dạy lớp đó
- Cần thêm điều kiện để đảm bảo Teacher thực sự dạy lớp

### **Logic mới đúng:**
- Sử dụng `classes` relationship trực tiếp
- Teacher có relationship Many-to-Many với Class
- Đảm bảo Teacher thực sự được assign cho lớp đó

## Lưu ý:
- Cần đảm bảo dữ liệu trong database đúng
- Teacher phải được assign cho Class trong relationship
- Role-based filtering hoạt động đúng cho từng role
- URL parameters được xử lý đúng 