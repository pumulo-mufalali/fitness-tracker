"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleSchema = exports.ScheduleItemSchema = exports.GoalSchema = exports.LogEntryInputSchema = exports.ExerciseSchema = exports.UserSchema = exports.PrivacyEnum = exports.LanguageEnum = exports.UnitsEnum = exports.ThemeEnum = void 0;
const zod_1 = require("zod");
exports.ThemeEnum = zod_1.z.enum(["light", "dark", "system"]);
exports.UnitsEnum = zod_1.z.enum(["metric", "imperial"]);
exports.LanguageEnum = zod_1.z.enum(["en", "es", "fr", "de"]);
exports.PrivacyEnum = zod_1.z.enum(["private", "friends", "public"]);
exports.UserSchema = zod_1.z.object({
    uid: zod_1.z.string(),
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(), // required email
    age: zod_1.z.number().min(13),
    weightKg: zod_1.z.number().positive(),
    heightCm: zod_1.z.number().positive().optional(),
    fitnessGoal: zod_1.z.string().optional(),
    theme: exports.ThemeEnum.default("system"),
    // Settings
    units: exports.UnitsEnum.default("metric"),
    language: exports.LanguageEnum.default("en"),
    privacy: exports.PrivacyEnum.default("private"),
    notifications: zod_1.z.object({
        workoutReminders: zod_1.z.boolean().default(true),
        goalAchievements: zod_1.z.boolean().default(true),
        weeklyProgress: zod_1.z.boolean().default(false),
    }).default({}),
    dataSharing: zod_1.z.boolean().default(true),
    activityTracking: zod_1.z.boolean().default(true),
});
exports.ExerciseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    category: zod_1.z.enum(["cardio", "strength", "stretching", "full_body"]),
    imageUrl: zod_1.z.string().url(),
});
exports.LogEntryInputSchema = zod_1.z.object({
    workoutId: zod_1.z.string(),
    durationSeconds: zod_1.z.number().positive(),
    notes: zod_1.z.string().optional(),
    date: zod_1.z.coerce.date().default(() => new Date()),
});
exports.GoalSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string().min(1, "Title is required"),
    target: zod_1.z.number().positive(),
    current: zod_1.z.number().min(0),
    unit: zod_1.z.string().min(1, "Unit is required"),
    category: zod_1.z.enum(["weight"]),
    deadline: zod_1.z.string(),
    createdAt: zod_1.z.string().optional(),
});
exports.ScheduleItemSchema = zod_1.z.object({
    time: zod_1.z.string(),
    activity: zod_1.z.string(),
});
exports.ScheduleSchema = zod_1.z.object({
    id: zod_1.z.string(),
    monday: zod_1.z.array(exports.ScheduleItemSchema).default([]),
    tuesday: zod_1.z.array(exports.ScheduleItemSchema).default([]),
    wednesday: zod_1.z.array(exports.ScheduleItemSchema).default([]),
    thursday: zod_1.z.array(exports.ScheduleItemSchema).default([]),
    friday: zod_1.z.array(exports.ScheduleItemSchema).default([]),
    saturday: zod_1.z.array(exports.ScheduleItemSchema).default([]),
    sunday: zod_1.z.array(exports.ScheduleItemSchema).default([]),
    createdAt: zod_1.z.string().optional(),
    updatedAt: zod_1.z.string().optional(),
});
