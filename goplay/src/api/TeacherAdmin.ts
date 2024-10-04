import { fetch, post, put, remove } from '../api/http-server';

export const heroj7GetDBStartData = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7GetDBStartData', paramObj);
  },
};

export const heroj7GetClassList = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7GetClassList', paramObj);
  },
};

export const heroj7GetStudentList = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7GetStudentList', paramObj);
  },
};
export const heroj7GetDBForumDataCount = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7GetDBForumDataCount', paramObj);
  },
};
export const heroj7GetDBLoginCount = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7GetDBLoginCount', paramObj);
  },
};
export const heroj7GetDBLoginUser = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7GetDBLoginUser', paramObj);
  },
};
export const heroj7GetDBOnlineTime = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7GetDBOnlineTime', paramObj);
  },
};
export const heroj7GetDBStudyTime = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7GetDBStudyTime', paramObj);
  },
};
export const heroj7GetDBSubjectTime = {
  fetch: (paramObj: {} | undefined) => {
    return fetch('/heroj7GetDBSubjectTime', paramObj);
  },
};
