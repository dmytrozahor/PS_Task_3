import axios from "../../misc/requests";
import config from "../../config";

const {
    AUTHORS_SERVICE,
} = config || { BOOKS_SERVICE: 'http://localhost:8080/api/authors' };

const fetchAuthor = (bookId) => {
    return axios.get(`${AUTHORS_SERVICE}/${bookId}`)
        .then((res) => {
            return Promise.resolve(res);
        });
};

const fetchAuthors = () => {
    return axios.post(`${AUTHORS_SERVICE}/_list`, {
        size: 50,
        page: 0
    })
        .then((res) => {
            return Promise.resolve(res);
        });
};

export default {
    fetchAuthor,
    fetchAuthors
}