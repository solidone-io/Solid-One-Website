export function asyncRoute(handler) {
    return (req, res, next) => {
        void handler(req, res).catch(next);
    };
}
