// utils/validation.ts
import moment from "moment";
import * as Yup from "yup";

// ✅ Regex Patterns
const emailRegex =
  /^[A-Za-z0-9][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const phoneRegex = /^[6-9]\d{9}$/;

// ---------- Helper: Email or Phone Validator ----------
const emailOrPhoneValidator = function (value: string) {
  if (!value) return false;

  // 👉 If only digits, treat as phone
  if (/^\d+$/.test(value)) {
    if (!phoneRegex.test(value)) {
      return this.createError({
        message: "Enter a valid 10-digit phone number",
      });
    }
    return true;
  }

  // 👉 If user typed something like "gmail.com" or "gamail.com" without '@'
  if (!value.includes("@") && value.toLowerCase().includes("gmail")) {
    return this.createError({
      message: "Please enter correct Gmail domain (gmail.com)",
    });
  }

  // 👉 If contains '@', treat as email
  if (value.includes("@")) {
    if (!emailRegex.test(value)) {
      return this.createError({
        message: "Enter a valid email address",
      });
    }

    // ---------- Gmail Domain Strict Check ----------
    const domain = value.split("@")[1]?.toLowerCase();

    if (domain.startsWith("gmail")) {
      if (domain !== "gmail.com") {
        return this.createError({
          message: "Please enter correct Gmail domain (gmail.com)",
        });
      }
    }

    return true;
  }

  // 👉 Invalid input (neither proper phone nor email)
  return this.createError({
    message: "Enter a valid email or 10-digit phone number",
  });
};

// ---------- Signup Schema ----------
export const signUpSchema = Yup.object().shape({
  full_name: Yup.string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .max(50, "Full name cannot exceed 50 characters")
    .required("Full name is required"),

  email_or_phone_number: Yup.string()
    .trim()
    .required("Mobile number or Email is required")
    .test("emailOrPhone", "Invalid input", emailOrPhoneValidator),

  isAdult: Yup.boolean().oneOf(
    [true],
    "You must confirm that you are 18 years or older"
  ),

  isAgree: Yup.boolean().oneOf(
    [true],
    "You must agree to the Terms & Conditions and Privacy Policy"
  ),
});


// ---------- User ID Schema ----------
export const userIdSchema = Yup.object().shape({
  user_id: Yup.string()
    .trim()
    .min(3, "User ID must be at least 3 characters")
    .max(30, "User ID cannot exceed 30 characters")
    .required("User ID is required"),

  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must include at least one uppercase letter")
    .matches(/[a-z]/, "Must include at least one lowercase letter")
    .matches(/\d/, "Must include at least one number")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Must include at least one special character"
    ),

  dob: Yup.date()
    .required("Date of birth is required")
    .typeError("Invalid date")
    .test(
      "age",
      "You must be at least 18 years old",
      (value) => {
        if (!value) return false;
        return moment().diff(moment(value), "years") >= 18;
      }
    ),
});

// ---------- Login Schemas ----------
export const passwordLoginSchema = Yup.object().shape({
  email_or_phone_number: Yup.string()
    .required("Email or Mobile Number is required")
    .test("emailOrPhone", "Invalid input", emailOrPhoneValidator),

  password: Yup.string()
    .required("Password is required")
});

export const otpLoginSchema = Yup.object().shape({
  email_or_phone_number: Yup.string()
    .required("Email or Mobile Number is required")
    .test("emailOrPhone", "Invalid input", emailOrPhoneValidator),
});

export const forgotPasswordSchema = Yup.object().shape({
  email_or_phone_number: Yup.string()
    .required("Email or Mobile Number is required")
    .test("emailOrPhone", "Invalid input", emailOrPhoneValidator),
});

// ---------- Reset Password Schema ----------
export const resetPasswordSchema = Yup.object().shape({
  new_password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must include at least one uppercase letter")
    .matches(/[a-z]/, "Must include at least one lowercase letter")
    .matches(/\d/, "Must include at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Must include at least one special character"),

  confirm_password: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("new_password")], "Passwords must match"),
});

// ---------- Profile Schema ----------
export const ProfileSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters")
    .required("Name is required"),

  email: Yup.string()
    .trim()
    .matches(emailRegex, "Enter a valid email address")
    .required("Email is required"),

  phone: Yup.string()
    .nullable()
    .test("valid-phone", "Enter a valid 10-digit number", (value) => {
      if (!value) return true;
      return /^[0-9]{10}$/.test(value);
    }),

  companyDescription: Yup.string()
    .min(1, "Description should be minimum 1 characters")
    .max(250, "Description can not exceed 250 characters")
});

export const InterestsSchema = Yup.object().shape({
  interests: Yup.array()
    .min(1, "Please select at least one interest")
    .required("Select at least one interest"),
  profession: Yup.array()
    .min(1, "Please select at least one profession")
    .required("Select at least one profession"),
});

export const ticketValidation = Yup.object().shape({
  issue_type: Yup.string().required("Please select an issue type"),
  description: Yup.string()
    .min(1, "Description should be minimum 1 characters")
    .max(250, "Description can not exceed 250 characters")
    .required("Please enter description"),
  image_url: Yup.string().nullable(),

});

export const CategorySchema = Yup.object().shape({
  category: Yup.string()
    .trim()
    .required("Category name is required"),

  subCategories: Yup.array()
    .of(Yup.string().trim().required("Subcategory cannot be empty"))
    .min(1, "At least one subcategory is required")
    .max(10, "Maximum 10 subcategories allowed"),
});

export const DegreeSchema = Yup.object().shape({
  degree: Yup.string()
    .trim()
    .required("Degree is required"),
});

export const educationSchema = Yup.object().shape({
  schoolName: Yup.string().required("School name is required"),

  sslcGrade: Yup.string()
    .matches(/^[A-Za-z+-]+$/, "Only A, B, C… allowed")
    .required("10th grade is required"),

  sslcYear: Yup.number()
    .typeError("Enter valid year")
    .required("10th passing year is required"),

  hscGrade: Yup.string()
    .matches(/^[A-Za-z+-]+$/, "Only A, B, C… allowed")
    .required("12th grade is required"),

  hscYear: Yup.number()
    .typeError("Enter valid year")
    .required("12th passing year is required"),

  college: Yup.array().of(
    Yup.object().shape({
      degree: Yup.string().required("Degree is required"),
      collegeName: Yup.string().required("College name is required"),
      passingYear: Yup.number()
        .typeError("Enter valid year")
        .required("Passing year is required"),
    })
  ),

  experiences: Yup.array().of(
    Yup.object().shape({
      companyName: Yup.string().required("Company name is required"),
      position: Yup.string().required("Position is required"),
      joiningYear: Yup.number()
        .typeError("Enter valid year")
        .required("Joining year is required"),
    })
  ),
});

export const instituteSchema = Yup.object().shape({
  state: Yup.string().required("State is required"),
  district: Yup.string().required("District is required"),
  name: Yup.string().trim().required("Name is required"),
});

export const businessTimingSchema = Yup.object().shape({
  timings: Yup.array()
    .of(
      Yup.object().shape({
        openTime: Yup.string().nullable(),
        closeTime: Yup.string()
          .nullable()
          .test(
            "close-required-if-open",
            "Closing time is required when opening time is set",
            function (value) {
              const { openTime } = this.parent;
              if (openTime && !value) return false;
              return true;
            }
          ),
      })
    )
    .test(
      "at-least-one-day",
      "At least one day must have opening and closing time",
      (timings: any[]) => {
        return timings.some(
          (t) => t.openTime && t.closeTime
        );
      }
    ),
});

export const ChangePasswordSchema = Yup.object().shape({
  old_password: Yup.string().required("Enter your current password"),

  new_password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Enter your new password"),

  confirm_password: Yup.string()
    .oneOf([Yup.ref("new_password")], "Passwords do not match")
    .required("Confirm your password"),
});

export const addBasicDetailsSchema = Yup.object().shape({
  full_name: Yup.string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .required("Full name is required"),

  user_id: Yup.string()
    .trim()
    .min(3, "User ID must be at least 3 characters")
    .max(30, "User ID cannot exceed 30 characters")
    .required("User ID is required"),

  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must include at least one uppercase letter")
    .matches(/[a-z]/, "Must include at least one lowercase letter")
    .matches(/\d/, "Must include at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Must include at least one special character"),

  dob: Yup.date()
    .required("Date of birth is required")
    .test("age-check", "You must be at least 18 years old", (value) => {
      if (!value) return false;
      return moment().diff(moment(value), "years") >= 18;
    }),

  isAdult: Yup.boolean()
    .oneOf([true], "Please confirm that you are 18+"),

  isAgree: Yup.boolean()
    .oneOf([true], "You must accept Terms & Conditions"),

});

export const addBasicDetailsSchema1 = Yup.object().shape({
  full_name: Yup.string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .required("Full name is required"),

  user_id: Yup.string()
    .trim()
    .min(3, "User ID must be at least 3 characters")
    .max(30, "User ID cannot exceed 30 characters")
    .required("User ID is required"),

  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must include at least one uppercase letter")
    .matches(/[a-z]/, "Must include at least one lowercase letter")
    .matches(/\d/, "Must include at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Must include at least one special character"),

  dob: Yup.date()
    .required("Date of birth is required")
    .test("age-check", "You must be at least 18 years old", (value) => {
      if (!value) return false;
      return moment().diff(moment(value), "years") >= 18;
    }),

});

export const EventValidationSchema = Yup.object().shape({
  category_id: Yup.string().required("Category is required"),
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),
  venue: Yup.string()
    .required("Venue is required")
    .min(3, "Venue must be at least 3 characters"),
  event_type: Yup.string()
    .oneOf(["free", "paid"], "Invalid event type")
    .required("Event type is required"),
  entry_fee: Yup.number().when("event_type", {
    is: "paid",
    then: (schema) =>
      schema
        .required("Entry fee is required for paid events")
        .positive("Entry fee must be greater than 0")
        .min(1, "Entry fee must be at least 1"),
    otherwise: (schema) => schema.notRequired(),
  }),
  terms_and_conditions: Yup.string().max(
    1000,
    "Terms & Conditions must not exceed 1000 characters"
  ),
});

export const RegisterValidationSchema = Yup.object().shape({
  passes: Yup.number()
    .required("Number of passes is required")
    .min(1, "At least 1 pass required"),

  name: Yup.string()
    .trim()
    .required("Name is required"),

  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter valid 10 digit mobile number")
    .required("Mobile number is required"),

  email: Yup.string()
    .email("Enter valid email")
    .required("Email is required"),

  gst: Yup.string().nullable(),
});