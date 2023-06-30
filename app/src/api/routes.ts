export const squealerBaseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '';

export const apiBase = `${squealerBaseUrl}/api`;

export const apiUserBase = `${apiBase}/user`;
export const apiDelete = `${apiBase}/user/delete`;
export const apiQuotaBase = `${apiBase}/user/quota`;
export const apiMessageBase = `${apiBase}/message`;
export const apiFeedBase = `${apiBase}/feed`;

export const apiTemporized = `${apiBase}/temporizzati`;

export const apiLogin = `${apiBase}/auth/login`;
export const apiAuthUserBase = `${apiBase}/auth/user`;
export const apiCreate = `${apiBase}/auth/create`;
export const apiSettingReset = `${apiBase}/auth/setting-reset`;
export const apiResetPassword = `${apiBase}/auth/reset-password`;

export const apiChannelBase = `${apiBase}/channel`;
export const apiBuyChannel = `${apiBase}/channel/create`;

export const imageBase = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '';
export const apiFileUpload = `${apiBase}/file/upload`;
