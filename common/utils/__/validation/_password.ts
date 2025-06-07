function _Password(value: string, minLength: number = 8): boolean {
    if (value.length < minLength) return false;

    // regex checks
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    return hasUppercase && hasLowercase && hasNumber && hasSpecial;
}

export default _Password;
