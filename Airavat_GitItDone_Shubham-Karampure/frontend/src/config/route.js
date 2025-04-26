const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const API_ROUTES = {
    AUTH: {
        REGISTER: `${BACKEND_URL}/user/auth/register`,
        LOGIN: `${BACKEND_URL}/user/auth/login`,
    },
    IMAGE: {
        UPLOAD: `${BACKEND_URL}/image/upload`,
    },
    INTEREST: {
        ADD: `${BACKEND_URL}/interest/add-interest`,
        GET: `${BACKEND_URL}/interest/get-interests`,
        DELETE: `${BACKEND_URL}/interest/delete-interest`,
    }
};

export default API_ROUTES;
