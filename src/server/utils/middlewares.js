const errorHandler = async (error, request, response, next) => {
    response.status(500);

    console.error(error);
};

export default {
    errorHandler,
}