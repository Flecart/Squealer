const minute = 60 * 1000;
const hour = 60 * minute;
const day = 24 * hour;
const week = 7 * day;
const month = 30 * day;
const year = 365 * day;

export function toHumanReadableDate(datestring: string): string {
    const date = new Date(datestring);
    const currentDate = new Date();
    const diff = currentDate.getTime() - date.getTime();

    if (diff < hour) {
        const minutes = Math.floor(diff / minute);
        if (minutes === 0) {
            return 'ora';
        }
        return `${minutes} minut${minutes > 1 ? 'i' : 'o'} fa`;
    } else if (diff < day) {
        const hours = Math.floor(diff / hour);
        return `${hours} or${hours > 1 ? 'e' : 'a'} fa`;
    } else if (diff < week) {
        const days = Math.floor(diff / day);
        return `${days} giorn${days > 1 ? 'i' : 'o'} fa`;
    } else if (diff < month) {
        const weeks = Math.floor(diff / week);
        return `${weeks} settiman${weeks > 1 ? 'e' : 'a'} fa`;
    } else if (diff < year) {
        const months = Math.floor(diff / month);
        return `${months} mes${months > 1 ? 'i' : 'e'} fa`;
    } else {
        const years = Math.floor(diff / year);
        return `${years} ann${years > 1 ? 'i' : 'o'} fa`;
    }
}
