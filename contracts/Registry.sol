pragma solidity ^0.4.19;
import "./utils/strings.sol"; // github.com/Arachnid/solidity-stringutils/strings.sol


contract Registry {
    using strings for *;

    // solhint-disable-next-line max-line-length
    event LogPublish(address indexed issuer, address indexed subject, bytes32 action, bytes32 indexed contentType, string cid, uint256 prevBlock);
    event LogPublishString(address indexed issuer, string message);

    uint256 public prevBlock; // zero == first publish

    // recognized actions == CRUD.
    function publish(address[] _subjects, bytes32[] _actions, bytes32[] _contentTypes, string _cids) public {
        require(_subjects.length == _actions.length && _actions.length == _contentTypes.length);

        var prepCids = _cids.toSlice();
        for (uint8 i = 0; i < _contentTypes.length; i++) {
            string memory cid = prepCids.split("|".toSlice()).toString();
            require(bytes(cid).length != 0);
            emit LogPublish(msg.sender, _subjects[i], _actions[i], _contentTypes[i], cid, prevBlock);
            if (prevBlock != block.number) {
                prevBlock = block.number;
            }
        }
    }

    // a fallback: generic string publisher in case the the more specific version is not sufficient in future.
    function publishString(string _message) public {
        emit LogPublishString(msg.sender, _message);
    }
}
