const isAdmin = (s: string) => {
    if (s === 'ADMIN') {
        return true
    }

    return false
}

export default isAdmin