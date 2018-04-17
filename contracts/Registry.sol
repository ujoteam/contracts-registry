pragma solidity 0.4.19;
import "./utils/strings.sol"; // github.com/Arachnid/solidity-stringutils/strings.sol


contract Registry {
    using strings for *;

    // todo: choose what to index
    event LogPublish(address issuer, address subject, bytes32 action, bytes32 contentType, string cid, uint prevblock);
    event LogPublishString(address issuer, string message);

    uint currBlock = block.number;
    // recognized actions == CRUD.
    function publish(address[] _subjects, bytes32[] _actions, bytes32[] _contentTypes, string _cids) public {
        require(_subjects.length == _actions.length && _actions.length == _contentTypes.length);
        var prepCids = _cids.toSlice();
        for (uint8 i = 0; i < _contentTypes.length; i++) {
            string memory cid = prepCids.split("|".toSlice()).toString();
            require(bytes(cid).length != 0);
            LogPublish(msg.sender, _subjects[i], _actions[i], _contentTypes[i], cid, currBlock);
            currBlock = block.number;
        }
    }

    // a fallback: generic string publisher in case the the more specific version is not sufficient.
    function publishString(string _message) public {
        LogPublishString(msg.sender, _message);
    }
}
