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
    
    @Property
    private final FileAttachment attachment;
    
    @Property
    private final boolean hasAttachment;

    public ChatMessage(
            @JsonProperty("sender") final String sender,
            @JsonProperty("content") final String content,
            @JsonProperty("timestamp") final String timestamp,
            @JsonProperty("isRead") final boolean isRead,
            @JsonProperty("attachment") final FileAttachment attachment,
            @JsonProperty("hasAttachment") final boolean hasAttachment) {
        this.sender = sender;
        this.content = content;
        this.timestamp = timestamp;
        this.isRead = isRead;
        this.attachment = attachment;
        this.hasAttachment = hasAttachment;
    }

    // Getters
    public String getSender() { return sender; }
    public String getContent() { return content; }
    public String getTimestamp() { return timestamp; }
    public boolean getIsRead() { return isRead; }
    public FileAttachment getAttachment() { return attachment; }
    public boolean getHasAttachment() { return hasAttachment; }

    @Override
    public boolean equals(final Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        ChatMessage other = (ChatMessage) obj;
        return Objects.equals(sender, other.sender) &&
               Objects.equals(content, other.content) &&
               Objects.equals(timestamp, other.timestamp) &&
               isRead == other.isRead &&
               Objects.equals(attachment, other.attachment) &&
               hasAttachment == other.hasAttachment;
    }

    @Override
    public int hashCode() {
        return Objects.hash(sender, content, timestamp, isRead, attachment, hasAttachment);
    }

    @Override
    public String toString() {
        return String.format("ChatMessage [sender=%s, timestamp=%s, isRead=%b, hasAttachment=%b]",
                            sender, timestamp, isRead, hasAttachment);
    }
}
