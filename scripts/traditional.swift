import Foundation
let data = FileHandle.standardInput.readDataToEndOfFile()
let text = String(data: data, encoding: .utf8)!
let output = text.applyingTransform(StringTransform("Simplified-Traditional"), reverse: false)!
FileHandle.standardOutput.write(output.data(using: .utf8)!)
