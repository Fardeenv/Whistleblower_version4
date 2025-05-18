package Whistleblower;
import com.owlike.genson.annotation.JsonProperty;
import org.hyperledger.fabric.contract.annotation.DataType;
import org.hyperledger.fabric.contract.annotation.Property;
import java.util.Objects;

@DataType
public class FileAttachment {
    @Property
    private final String fileName;

    @Property
    private final String fileType;

    @Property
    private final String filePath;
    
    @Property
    private final String timestamp;
    
    @Property
    private final String uploadedBy;
    
    @Property
    private final String fileSize;

    public FileAttachment(
            @JsonProperty("fileName") final String fileName,
            @JsonProperty("fileType") final String fileType,
            @JsonProperty("filePath") final String filePath,
            @JsonProperty("timestamp") final String timestamp,
            @JsonProperty("uploadedBy") final String uploadedBy,
            @JsonProperty("fileSize") final String fileSize) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.filePath = filePath;
        this.timestamp = timestamp;
        this.uploadedBy = uploadedBy;
        this.fileSize = fileSize;
    }

    // Getters
    public String getFileName() { return fileName; }
    public String getFileType() { return fileType; }
    public String getFilePath() { return filePath; }
    public String getTimestamp() { return timestamp; }
    public String getUploadedBy() { return uploadedBy; }
    public String getFileSize() { return fileSize; }

    @Override
    public boolean equals(final Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        FileAttachment other = (FileAttachment) obj;
        return Objects.equals(fileName, other.fileName) &&
               Objects.equals(fileType, other.fileType) &&
               Objects.equals(filePath, other.filePath) &&
               Objects.equals(timestamp, other.timestamp) &&
               Objects.equals(uploadedBy, other.uploadedBy) &&
               Objects.equals(fileSize, other.fileSize);
    }

    @Override
    public int hashCode() {
        return Objects.hash(fileName, fileType, filePath, timestamp, uploadedBy, fileSize);
    }

    @Override
    public String toString() {
        return String.format("FileAttachment [fileName=%s, fileType=%s, timestamp=%s, uploadedBy=%s, fileSize=%s]",
                           fileName, fileType, timestamp, uploadedBy, fileSize);
    }
}
