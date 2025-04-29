import { ACM } from "@aws-sdk/client-acm"

AWS =
  ACM: new ACM region: "us-east-1"



hasCertificate = (name) -> (await getCertification domain)?

matchDomain = ( domain ) -> 
  ({ DomainName }) -> domain == DomainName

getCertificate = ( domain ) ->
  { $metadata, CertificateSummaryList } = await AWS.ACM.listCertificates
    CertificateStatuses: [ "ISSUED" ]
  if $metadata.httpStatusCode == 200
    if ( certificate = CertificateSummaryList.find matchDomain domain )?
      arn: certificate.CertificateArn
      _: certificate
  else
    throw new Error "Dolores: VPC.SecurityGroups.list: unexpected status
      [ #{ $metadata.httpStatusCode }"

getCertificateARN = (domain) -> ( await getCertificate domain ).arn

export {
  hasCertificate
  getCertificate
  getCertificateARN
}