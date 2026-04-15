import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettierConfig from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    // 린팅 제외 경로
    {
        ignores: [".next/**", "node_modules/**", "out/**", "shrimp_data/**"],
    },
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    // Prettier와 충돌하는 ESLint 규칙 비활성화 (반드시 extends 뒤에 위치)
    prettierConfig,
    // 커스텀 규칙 (포매팅 무관 규칙만 추가)
    {
        rules: {
            // any 타입 사용 금지
            "@typescript-eslint/no-explicit-any": "error",
            // 미사용 변수 경고 (_접두사 허용)
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
            // console.log 경고 (warn/error는 허용)
            "no-console": ["warn", { allow: ["warn", "error"] }],
        },
    },
];

export default eslintConfig;
