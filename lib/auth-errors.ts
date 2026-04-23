const ERROR_MAP: Record<string, string> = {
    "Invalid login credentials": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "Email not confirmed": "이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.",
    "Too many requests": "너무 많은 시도가 감지되었습니다. 잠시 후 다시 시도해주세요.",
    "User already registered": "이미 가입된 이메일 주소입니다. 로그인을 시도해주세요.",
    "Password should be at least 6 characters": "비밀번호는 최소 6자 이상이어야 합니다.",
    "Signup requires a valid password": "유효한 비밀번호를 입력해주세요.",
    "Unable to validate email address: invalid format": "올바른 이메일 형식을 입력해주세요.",
    "For security purposes, you can only request this once every 60 seconds":
        "보안상 60초에 한 번만 요청할 수 있습니다. 잠시 후 다시 시도해주세요.",
};

export function translateAuthError(message: string): string {
    if (ERROR_MAP[message]) return ERROR_MAP[message];

    const lowerMessage = message.toLowerCase();
    for (const [key, value] of Object.entries(ERROR_MAP)) {
        if (lowerMessage.includes(key.toLowerCase())) return value;
    }

    return "오류가 발생했습니다. 다시 시도해주세요.";
}
