"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasCertificate = exports.getCertificateARN = exports.getCertificate = void 0;

var _clientAcm = require("@aws-sdk/client-acm");

var AWS,
    getCertificate,
    getCertificateARN,
    hasCertificate,
    indexOf = [].indexOf;
exports.hasCertificate = hasCertificate;
exports.getCertificateARN = getCertificateARN;
exports.getCertificate = getCertificate;
AWS = {
  ACM: new _clientAcm.ACM({
    region: "us-east-1"
  })
};

exports.hasCertificate = hasCertificate = async function (domain) {
  return (await getCertification(domain)) != null;
};

exports.getCertificate = getCertificate = async function (domain) {
  var Certificate, CertificateArn, CertificateSummaryList, i, len;
  ({
    CertificateSummaryList
  } = await AWS.ACM.listCertificates({
    CertificateStatuses: ["ISSUED"]
  }));

  for (i = 0, len = CertificateSummaryList.length; i < len; i++) {
    ({
      CertificateArn
    } = CertificateSummaryList[i]);
    ({
      Certificate
    } = await AWS.ACM.describeCertificate({
      CertificateArn
    }));

    if (indexOf.call(Certificate.SubjectAlternativeNames, domain) >= 0) {
      return {
        _: Certificate,
        arn: CertificateArn
      };
    }
  }

  return void 0;
};

exports.getCertificateARN = getCertificateARN = async function (domain) {
  return (await getCertificate(domain)).arn;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hY20uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFBQSxJQUFBLEdBQUE7QUFBQSxJQUFBLGNBQUE7QUFBQSxJQUFBLGlCQUFBO0FBQUEsSUFBQSxjQUFBO0FBQUEsSUFBQSxPQUFBLEdBQUEsR0FBQSxPQUFBOzs7O0FBRUEsR0FBQSxHQUNFO0FBQUEsRUFBQSxHQUFBLEVBQUssSUFBQSxjQUFBLENBQVE7QUFBQSxJQUFBLE1BQUEsRUFBUTtBQUFSLEdBQVI7QUFBTCxDQURGOztBQUdBLHlCQUFBLGNBQUEsR0FBaUIsZ0JBQUEsTUFBQSxFQUFBO1NBQVksQ0FBQSxNQUFBLGdCQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsSTtBQUFaLENBQWpCOztBQUVBLHlCQUFBLGNBQUEsR0FBaUIsZ0JBQUEsTUFBQSxFQUFBO0FBQ2pCLE1BQUEsV0FBQSxFQUFBLGNBQUEsRUFBQSxzQkFBQSxFQUFBLENBQUEsRUFBQSxHQUFBO0FBQUUsR0FBQTtBQUFBLElBQUE7QUFBQSxNQUE2QixNQUFNLEdBQUcsQ0FBQyxHQUFKLENBQUEsZ0JBQUEsQ0FDakM7QUFBQSxJQUFBLG1CQUFBLEVBQXFCLENBQUEsUUFBQTtBQUFyQixHQURpQyxDQUFuQzs7QUFFQSxPQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLHNCQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsR0FBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7S0FBSTtBQUFBLE1BQUE7QUFBQSxRQUFBLHNCQUFBLENBQUEsQ0FBQSxDO0FBQ0YsS0FBQTtBQUFBLE1BQUE7QUFBQSxRQUFrQixNQUFNLEdBQUcsQ0FBQyxHQUFKLENBQUEsbUJBQUEsQ0FBNEI7QUFBcEQsTUFBQTtBQUFvRCxLQUE1QixDQUF4Qjs7QUFDQSxRQUFBLE9BQUEsQ0FBQSxJQUFBLENBQWEsV0FBVyxDQUFDLHVCQUF6QixFQUFHLE1BQUgsS0FBQSxDQUFBLEVBQUE7QUFDRSxhQUNFO0FBQUEsUUFBQSxDQUFBLEVBQUEsV0FBQTtBQUNBLFFBQUEsR0FBQSxFQUFLO0FBREwsT0FERjs7QUFISjs7U0FNQSxLQUFBLEM7QUFUZSxDQUFqQjs7QUFXQSw0QkFBQSxpQkFBQSxHQUFvQixnQkFBQSxNQUFBLEVBQUE7U0FBWSxDQUFFLE1BQU0sY0FBQSxDQUFSLE1BQVEsQ0FBUixFQUFnQyxHO0FBQTVDLENBQXBCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQUNNIH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1hY21cIlxuXG5BV1MgPVxuICBBQ006IG5ldyBBQ00gcmVnaW9uOiBcInVzLWVhc3QtMVwiXG4gIFxuaGFzQ2VydGlmaWNhdGUgPSAoZG9tYWluKSAtPiAoYXdhaXQgZ2V0Q2VydGlmaWNhdGlvbiBkb21haW4pP1xuXG5nZXRDZXJ0aWZpY2F0ZSA9IChkb21haW4pIC0+XG4gIHsgQ2VydGlmaWNhdGVTdW1tYXJ5TGlzdCB9ID0gYXdhaXQgQVdTLkFDTS5saXN0Q2VydGlmaWNhdGVzXG4gICAgQ2VydGlmaWNhdGVTdGF0dXNlczogWyBcIklTU1VFRFwiIF1cbiAgZm9yIHsgQ2VydGlmaWNhdGVBcm4gfSBpbiBDZXJ0aWZpY2F0ZVN1bW1hcnlMaXN0XG4gICAgeyBDZXJ0aWZpY2F0ZSB9ID0gYXdhaXQgQVdTLkFDTS5kZXNjcmliZUNlcnRpZmljYXRlIHsgQ2VydGlmaWNhdGVBcm4gfVxuICAgIGlmIGRvbWFpbiBpbiBDZXJ0aWZpY2F0ZS5TdWJqZWN0QWx0ZXJuYXRpdmVOYW1lc1xuICAgICAgcmV0dXJuIFxuICAgICAgICBfOiBDZXJ0aWZpY2F0ZVxuICAgICAgICBhcm46IENlcnRpZmljYXRlQXJuXG4gIHVuZGVmaW5lZCAgXG5cbmdldENlcnRpZmljYXRlQVJOID0gKGRvbWFpbikgLT4gKCBhd2FpdCBnZXRDZXJ0aWZpY2F0ZSBkb21haW4gKS5hcm5cblxuZXhwb3J0IHtcbiAgaGFzQ2VydGlmaWNhdGVcbiAgZ2V0Q2VydGlmaWNhdGVcbiAgZ2V0Q2VydGlmaWNhdGVBUk5cbn0iXSwic291cmNlUm9vdCI6IiJ9
//# sourceURL=src/acm.coffee