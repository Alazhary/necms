-- =============================================
-- NECMS - نظام إدارة المراكز التعليمية
-- تشغيل هذا الملف في Supabase SQL Editor
-- =============================================

-- 1. الأدوار
CREATE TABLE roles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- 2. الصفوف الدراسية
CREATE TABLE grades (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  level INTEGER NOT NULL
);

-- 3. المواد الدراسية
CREATE TABLE subjects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  grade_id BIGINT REFERENCES grades(id) ON DELETE CASCADE
);

-- 4. البروفايلات (مستخدمين)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT NOT NULL,
  role_id BIGINT REFERENCES roles(id),
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 5. الطلاب
CREATE TABLE students (
  id BIGSERIAL PRIMARY KEY,
  student_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  grade_id BIGINT REFERENCES grades(id),
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  profile_id UUID REFERENCES profiles(id),
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 6. أولياء الأمور
CREATE TABLE parents (
  id BIGSERIAL PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT
);

-- 7. المدرسين
CREATE TABLE teachers (
  id BIGSERIAL PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  full_name TEXT NOT NULL,
  phone TEXT,
  specialization TEXT,
  is_active BOOLEAN DEFAULT true,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 8. المشرفين
CREATE TABLE supervisors (
  id BIGSERIAL PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  full_name TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 9. مواد المدرسين
CREATE TABLE teacher_subjects (
  id BIGSERIAL PRIMARY KEY,
  teacher_id BIGINT REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(teacher_id, subject_id)
);

-- 10. الحضور والغياب
CREATE TABLE attendance (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- 11. الامتحانات
CREATE TABLE exams (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject_id BIGINT REFERENCES subjects(id),
  grade_id BIGINT REFERENCES grades(id),
  exam_date DATE,
  max_score DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 12. نتائج الامتحانات
CREATE TABLE exam_results (
  id BIGSERIAL PRIMARY KEY,
  exam_id BIGINT REFERENCES exams(id) ON DELETE CASCADE,
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  score DECIMAL(10,2) NOT NULL,
  notes TEXT,
  UNIQUE(exam_id, student_id)
);

-- 13. متابعة يومية
CREATE TABLE daily_follow_ups (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('good', 'average', 'weak')),
  teacher_notes TEXT,
  teacher_id BIGINT REFERENCES teachers(id),
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 14. متابعة أسبوعية
CREATE TABLE weekly_follow_ups (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('good', 'average', 'weak')),
  notes TEXT,
  teacher_id BIGINT REFERENCES teachers(id),
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 15. متابعة شهرية
CREATE TABLE monthly_follow_ups (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('good', 'average', 'weak')),
  notes TEXT,
  teacher_id BIGINT REFERENCES teachers(id),
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 16. الإيرادات
CREATE TABLE revenues (
  id BIGSERIAL PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  source TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 17. المصروفات
CREATE TABLE expenses (
  id BIGSERIAL PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  date DATE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 18. الإشعارات
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 19. سجل النشاطات
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id BIGINT,
  details TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 20. رواتب المدرسين
CREATE TABLE teacher_payroll (
  id BIGSERIAL PRIMARY KEY,
  teacher_id BIGINT REFERENCES teachers(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  paid_date DATE,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 21. رواتب المشرفين
CREATE TABLE supervisor_payroll (
  id BIGSERIAL PRIMARY KEY,
  supervisor_id BIGINT REFERENCES supervisors(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  paid_date DATE,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- تفعيل RLS (Row Level Security)
-- =============================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisor_payroll ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies - الكل يستطيع القراءة
-- =============================================
CREATE POLICY "read_all" ON roles FOR SELECT USING (true);
CREATE POLICY "read_all" ON grades FOR SELECT USING (true);
CREATE POLICY "read_all" ON subjects FOR SELECT USING (true);

-- =============================================
-- RLS Policies - البروفايلات
-- =============================================
CREATE POLICY "read_own_profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- RLS Policies - الطلاب
-- =============================================
CREATE POLICY "read_students" ON students FOR SELECT USING (true);
CREATE POLICY "insert_students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "update_students" ON students FOR UPDATE USING (true);
CREATE POLICY "delete_students" ON students FOR DELETE USING (true);

-- =============================================
-- RLS Policies - باقي الجداول
-- =============================================
CREATE POLICY "all_access" ON teachers FOR ALL USING (true);
CREATE POLICY "all_access" ON supervisors FOR ALL USING (true);
CREATE POLICY "all_access" ON teacher_subjects FOR ALL USING (true);
CREATE POLICY "all_access" ON attendance FOR ALL USING (true);
CREATE POLICY "all_access" ON exams FOR ALL USING (true);
CREATE POLICY "all_access" ON exam_results FOR ALL USING (true);
CREATE POLICY "all_access" ON daily_follow_ups FOR ALL USING (true);
CREATE POLICY "all_access" ON weekly_follow_ups FOR ALL USING (true);
CREATE POLICY "all_access" ON monthly_follow_ups FOR ALL USING (true);
CREATE POLICY "all_access" ON revenues FOR ALL USING (true);
CREATE POLICY "all_access" ON expenses FOR ALL USING (true);
CREATE POLICY "all_access" ON notifications FOR ALL USING (true);
CREATE POLICY "all_access" ON audit_logs FOR ALL USING (true);
CREATE POLICY "all_access" ON teacher_payroll FOR ALL USING (true);
CREATE POLICY "all_access" ON supervisor_payroll FOR ALL USING (true);
CREATE POLICY "all_access" ON parents FOR ALL USING (true);

-- =============================================
-- البيانات الابتدائية
-- =============================================
INSERT INTO roles (name) VALUES
  ('owner'), ('supervisor'), ('teacher'), ('parent'), ('student');

INSERT INTO grades (name, level) VALUES
  ('الحضانة', 0),
  ('الأول الابتدائي', 1),
  ('الثاني الابتدائي', 2),
  ('الثالث الابتدائي', 3),
  ('الرابع الابتدائي', 4),
  ('الخامس الابتدائي', 5),
  ('السادس الابتدائي', 6),
  ('الأول الإعدادي', 7),
  ('الثاني الإعدادي', 8),
  ('الثالث الإعدادي', 9);

-- =============================================
-- دالة لإنشاء بروفايل تلقائياً بعد التسجيل
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'role_id')::bigint, 4)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
