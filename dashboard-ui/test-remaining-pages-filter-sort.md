# Kiểm tra Filter và Sort cho các trang còn lại

## Các trang đã được cập nhật:

### 1. **Parents** ✅
- **Filter**: Lớp học của con
- **Sort**: Tên phụ huynh, Email, Số điện thoại, Địa chỉ
- **Role-based**: Admin thấy tất cả, Teacher thấy parents của students họ dạy, Parent chỉ thấy chính mình

### 2. **Announcements** ✅
- **Filter**: Lớp học, Từ ngày, Đến ngày
- **Sort**: Tiêu đề, Ngày thông báo, Lớp học
- **Role-based**: Admin thấy tất cả, Teacher/Student/Parent thấy theo lớp

### 3. **Events** ✅
- **Filter**: Lớp học, Từ ngày, Đến ngày
- **Sort**: Tiêu đề, Thời gian bắt đầu, Thời gian kết thúc, Lớp học
- **Role-based**: Admin thấy tất cả, Teacher/Student/Parent thấy theo lớp

## Các trang còn lại cần cập nhật:

### 4. **Exams** (cần cập nhật)
- **Filter**: Lớp học, Môn học, Giáo viên, Từ ngày, Đến ngày
- **Sort**: Tiêu đề, Ngày thi, Môn học, Lớp học
- **Role-based**: Admin thấy tất cả, Teacher thấy exams họ tạo

### 5. **Lessons** (cần cập nhật)
- **Filter**: Lớp học, Môn học, Giáo viên, Ngày trong tuần
- **Sort**: Tên bài học, Thời gian, Môn học, Lớp học
- **Role-based**: Admin thấy tất cả, Teacher thấy lessons họ dạy

### 6. **Results** (cần cập nhật)
- **Filter**: Học sinh, Bài thi/Bài tập, Môn học
- **Sort**: Điểm, Ngày, Học sinh, Bài thi/Bài tập
- **Role-based**: Admin thấy tất cả, Teacher thấy results của students họ dạy

### 7. **Subjects** (cần cập nhật)
- **Filter**: Giáo viên
- **Sort**: Tên môn học, Số giáo viên
- **Role-based**: Admin thấy tất cả, Teacher thấy subjects họ dạy

### 8. **Attendance** (cần cập nhật)
- **Filter**: Lớp học, Ngày, Học sinh
- **Sort**: Ngày, Học sinh, Lớp học
- **Role-based**: Admin thấy tất cả, Teacher thấy attendance của lớp họ dạy

### 9. **Comments** (cần cập nhật)
- **Filter**: Bài thi/Bài tập, Học sinh, Loại comment
- **Sort**: Ngày, Học sinh, Bài thi/Bài tập
- **Role-based**: Admin thấy tất cả, Teacher thấy comments của students họ dạy

## Pattern chung cho tất cả trang:

### **Filter Options:**
```typescript
const filterOptions = [
  { key: "classId", label: "Lớp học", type: "select" },
  { key: "subjectId", label: "Môn học", type: "select" },
  { key: "teacherId", label: "Giáo viên", type: "select" },
  { key: "startDate", label: "Từ ngày", type: "date" },
  { key: "endDate", label: "Đến ngày", type: "date" },
];
```

### **Sort Options:**
```typescript
const sortOptions = [
  { key: "name", label: "Tên" },
  { key: "date", label: "Ngày" },
  { key: "class", label: "Lớp học" },
  { key: "subject", label: "Môn học" },
];
```

### **Role-based Filtering:**
```typescript
switch (role) {
  case "admin": break; // Thấy tất cả
  case "teacher": 
    // Chỉ thấy dữ liệu của lớp họ dạy
    break;
  case "student": 
    // Chỉ thấy dữ liệu của mình
    break;
  case "parent": 
    // Chỉ thấy dữ liệu của con
    break;
}
```

## Cách kiểm tra:

### 1. **Test Parents:**
1. Vào `/list/parents`
2. Test filter theo lớp học của con
3. Test sort theo tên, email, phone, address
4. Test role-based access

### 2. **Test Announcements:**
1. Vào `/list/announcements`
2. Test filter theo lớp, từ ngày, đến ngày
3. Test sort theo tiêu đề, ngày, lớp
4. Test role-based access

### 3. **Test Events:**
1. Vào `/list/events`
2. Test filter theo lớp, từ ngày, đến ngày
3. Test sort theo tiêu đề, thời gian, lớp
4. Test role-based access

## Lưu ý:
- Tất cả trang đều sử dụng `FilterSortGenericButtons`
- API endpoint `/api/filter-data` đã hỗ trợ đầy đủ dữ liệu
- Role-based filtering đảm bảo bảo mật
- URL persistence hoạt động cho tất cả trang
- UI/UX nhất quán across tất cả trang

## Kế hoạch tiếp theo:
1. Cập nhật trang Exams
2. Cập nhật trang Lessons
3. Cập nhật trang Results
4. Cập nhật trang Subjects
5. Cập nhật trang Attendance
6. Cập nhật trang Comments

## Kết quả mong đợi:
- Tất cả trang đều có filter và sort dropdown
- Role-based access control hoạt động đúng
- UI/UX nhất quán và dễ sử dụng
- Performance tốt với lazy loading
- URL persistence và bookmark support 