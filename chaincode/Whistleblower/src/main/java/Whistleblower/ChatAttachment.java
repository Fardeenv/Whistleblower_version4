package Whistleblower;
import com.owlike.genson.annotation.JsonProperty;
import org.hyperledger.fabric.contract.annotation.DataType;
import org.hyperledger.fabric.contract.annotation.Property;
import java.util.Objects;

@DataType
public class ChatAttachment {
    @Property
    private final String fileName;
    
    @Property
    private final String filePath;
    
    @Property
    private final String fileType;
    
    @Property
    private final String timestamp;
    
    public ChatAttachment(
            @JsonProperty("fileName") final String fileName,
            @JsonProperty("filePath") final String filePath,
            @JsonProperty("fileType") final String fileType,
            @JsonProperty("timestamp") final String timestamp) {
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileType = fileType;
        this.timestamp = timestamp;
    }
    
    // Getters
    public String getFileName() { return fileName; }
    public String getFilePath() { return filePath; }
    public String getFileType() { return fileType; }
    public String getTimestamp() { return timestamp; }
    
    @Override
    public boolean equals(final Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        ChatAttachment other = (ChatAttachment) obj;
        return Objects.equals(fileName, other.fileName) &&
               Objects.equals(filePath, other.filePath) &&
               Objects.equals(fileType, other.fileType) &&
               Objects.equals(timestamp, other.timestamp);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(fileName, filePath, fileType, timestamp);
    }
    
    @Override
    public String toString() {
        return String.format("ChatAttachment [fileName=%s, filePath=%s, fileType=%s, timestamp=%s]", 
                            fileName, filePath, fileType, timestamp);
    }
}
