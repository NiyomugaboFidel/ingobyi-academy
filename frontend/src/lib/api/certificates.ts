import { apiRequest } from './client';

export type Certificate = {
  id: string;
  code: string;
  courseId: string;
  userId: string;
  issuedAt: string;
  course?: { title: string; slug: string };
};

export function listMyCertificates(token: string) {
  return apiRequest<Certificate[]>('/certificates/mine', { token });
}

export function generateCertificate(courseId: string, token: string) {
  return apiRequest<Certificate>(`/certificates/generate/${courseId}`, {
    method: 'POST',
    token,
  });
}

export function verifyCertificate(code: string) {
  return apiRequest<{ valid: boolean; certificate?: Certificate }>(
    `/certificates/verify/${code}`,
  );
}
