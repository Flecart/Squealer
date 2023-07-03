/**
 *
 * @param {string} template
 * @param {string[]} args
 * @returns string
 */
export function stringFormat(template, args) {
    let formatted = template;

    args.forEach((arg, index) => {
        const regexp = new RegExp(`\\{${index}\\}`, 'gi');
        formatted = formatted.replace(regexp, arg);
    });

    return formatted;
}
const moddashBase = '/api/moddash';
const moddashPostBase = '/api/moddash/post';
export const moddashPosts = '/api/moddash/posts';
export const moddashDelete = '/api/moddash/deleteChannel/{0}';

export const updateRoleRoute = `${moddashBase}/updateRole/{0}/{1}}`;
export const channelRoute = `${moddashBase}/channel`;

export const postCopyRoute = `${moddashPostBase}/{0}/copy`;
export const postReactionRoute = `${moddashPostBase}/{0}/reaction`;
export const postWithIdRoute = `${moddashPostBase}/{0}`;

export const userRoute = `/api/user/{0}`;
export const usersRoute = `${moddashBase}/users`;

export const changeQuotaRoute = `${moddashBase}/changeQuota/{0}`;
export const suspendRoute = `${moddashBase}/suspend/{0}`;
