import Map "mo:core/Map";
import Text "mo:core/Text";

module {
  // Old data type for sessions
  type OldSessionInfo = {
    principal : Principal;
    username : Text;
    createdAt : Int;
  };

  // Old actor type (with authenticatedAdmins)
  type OldActor = {
    sessions : Map.Map<Text, OldSessionInfo>;
    authenticatedAdmins : Map.Map<Principal, Bool>;
  };

  // New session type
  type NewSessionInfo = {
    principal : Principal;
    username : Text;
    createdAt : Int;
    expiresAt : Int;
  };

  // New actor type
  type NewActor = {
    sessions : Map.Map<Text, NewSessionInfo>;
    users : Map.Map<Text, Text>;
  };

  public func run(old : OldActor) : NewActor {
    // Updated session duration (24 hours in nanoseconds)
    let SESSION_DURATION : Int = 24 * 60 * 60 * 1_000_000_000;

    // Transform the old sessions to new sessions with an expiresAt field
    let newSessions = old.sessions.map<Text, OldSessionInfo, NewSessionInfo>(
      func(_token, oldSession) {
        {
          oldSession with
          expiresAt = oldSession.createdAt + SESSION_DURATION;
        };
      }
    );

    // Output new state, including empty users map since users did not exist in previous version
    // authenticatedAdmins is not carried over to new version
    { sessions = newSessions; users = Map.empty<Text, Text>() };
  };
};
