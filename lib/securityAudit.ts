export function logSecurityEvent(_request: Request, _userId: string, _event: string, _detail = "") {
  /* 独立站点不写 Alcor 审计表。失败不能影响已经完成的保存。 */
}
