
import kepriData from '~/server/data/kepri-indicators.json';

export default defineEventHandler((event) => {
    return kepriData;
});
