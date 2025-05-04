package Whistleblower;
import com.owlike.genson.annotation.JsonProperty;
import org.hyperledger.fabric.contract.annotation.DataType;
import org.hyperledger.fabric.contract.annotation.Property;
import java.util.Objects;

@DataType
public class ChatMessage {
    @Property
    private final String sender; // 'whistleblower' or investigator ID
    
    @Property
    private final String content;
    
    @Property
    private final String timestamp;
    
    @Property
    private final boolean isRead;
    
    public ChatMessage(
            @JsonProperty("sender") final String sender,
            @JsonProperty("content") final String content,
            @JsonProperty("timestamp") final String timestamp,
            @JsonProperty("isRead") final boolean isRead) {
        this.sender = sender;
        this.content = content;
        this.timestamp = timestamp;
        this.isRead = isRead;
    }
    
    // Getters
    public String getSender() { return sender; }
    public String getContent() { return content; }
    public String getTimestamp() { return timestamp; }
    public boolean getIsRead() { return isRead; }
    
    @Override
    public boolean equals(final Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        ChatMessage other = (ChatMessage) obj;
        return Objects.equals(sender, other.sender) &&
               Objects.equals(content, other.content) &&
               Objects.equals(timestamp, other.timestamp) &&
               isRead == other.isRead;
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(sender, content, timestamp, isRead);
    }
    
    @Override
    public String toString() {
        return String.format("ChatMessage [sender=%s, timestamp=%s, isRead=%b]", 
                            sender, timestamp, isRead);
    }
}