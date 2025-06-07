export function ok(
    req: any,
    res: any,
    data: any,
    message?: string
) {
    res.status(200).json({
        success: true,
        data,
        message: message || 'Success',
    })
}
