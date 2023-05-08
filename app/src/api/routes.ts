const apiBase = `${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''}/api`;

export const apiLogin = `${apiBase}/auth/login`;
export const apiUserBase = `${apiBase}/user`;
export const apiCreate = `${apiBase}/auth/create`;
export const apiDelete = `${apiBase}/user/delete`;
export const apiMessageBase = `${apiBase}/message`;
export const apiFeedBase = `${apiBase}/feed`;
export const apiChannelBase = `${apiBase}/channel`;
export const apiFileUpload = `${apiBase}/upload`;

export const imageBase = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';
