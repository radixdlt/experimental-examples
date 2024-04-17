import Foundation

extension String {
    func hexToData() -> Data? {
        var data = Data()
        var startIndex = self.startIndex
        while startIndex < endIndex {
            let endIndex = index(startIndex, offsetBy: 2)
            if let byte = UInt8(self[startIndex ..< endIndex], radix: 16) {
                data.append(byte)
            } else {
                return nil // Invalid hex string
            }
            startIndex = endIndex
        }
        return data
    }
}
