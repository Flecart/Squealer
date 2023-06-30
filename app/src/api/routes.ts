export const squealerBaseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '';

export const apiBase = `${squealerBaseUrl}/api`;

export const apiLogin = `${apiBase}/auth/login`;
export const apiUserBase = `${apiBase}/user`;
export const apiAuthUserBase = `${apiBase}/auth/user`;
export const apiCreate = `${apiBase}/auth/create`;
export const apiDelete = `${apiBase}/user/delete`;
export const apiMessageBase = `${apiBase}/message`;
export const apiFeedBase = `${apiBase}/feed`;
export const apiChannelBase = `${apiBase}/channel`;
export const apiTemporized = `${apiBase}/temporizzati`;
export const apiQuotaBase = `${apiBase}/user/quota`;
export const apiSettingReset = `${apiBase}/auth/setting-reset`;
export const apiResetPassword = `${apiBase}/auth/reset-password`;

export const imageBase = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '';
export const apiFileUpload = `${apiBase}/file/upload`;
